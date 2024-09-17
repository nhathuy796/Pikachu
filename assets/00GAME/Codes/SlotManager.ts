import { _decorator, Component, instantiate, Node, Prefab,director, resources, SpriteFrame, SpriteRenderer, Vec3, Camera, math, Vec2, Line, Graphics, UITransform, view, Sprite } from 'cc';
import { HuynnLib } from './Lib/Singleton'; 
import { SlotHandle } from './SlotHandle';
const { ccclass, property } = _decorator;

@ccclass('SlotManager')
export class SlotManager extends HuynnLib.Singleton<SlotManager> {
    @property(Camera) cam:Camera; 
    @property(Camera) camCanvas:Camera; 

    @property(Number) width  = 1;
    @property(Number) height = 1;

    @property(Prefab) nodeSlot: Prefab;
    @property(SpriteFrame) images : SpriteFrame[] = [];
    @property(SlotHandle)slots: SlotHandle[][] = [];

    @property(SlotHandle) public currentSelect: SlotHandle[] = [null,null];
    @property(Number) currentIDs: Number[] = [];
    @property(Sprite) lineCtrl: Sprite;
    @property(Graphics) graphics: Graphics;
    @property(Sprite) slotGB: Sprite;

    start() {
        SlotManager.instance = this;
        this.Init();
    }

    Init(){
        resources.loadDir("Images/pokemons", SpriteFrame, this.onResourcesLoadDone.bind(this));
    }
 
    onResourcesLoadDone(err, spriteFrames){
        if (err) {
            console.error("Tải tài nguyên thất bại:", err);
            return;
        }

        this.images = spriteFrames; 
        console.log(`loaded totall ${this.images.length} images`);
        this.SpawSlots();
    }

    SpawSlots(){
       
        for(let x = 0; x < this.width; x++){
            let col = [];
            for(let y = 0; y < this.height; y++){
                let newSlot = instantiate(this.nodeSlot);
                 
                newSlot.setWorldPosition(new Vec3(x,y,0));
                newSlot.setParent(director.getScene());
                 
                col.push(newSlot.getComponent(SlotHandle));  
            }
 
            this.slots.push(col); 
        }

        let posCam = new Vec3(this.width/2 - 0.5, this.height/2,0);
        this.cam.node.setPosition(posCam);

        this.calculateIDs();
       
    }

    calculateIDs(){
        let maxCapacity = Math.floor( (this.width * this.height) / 2); 
        for(let i = 0; i< maxCapacity; i++){
            let imageRanIndex = Math.floor(math.random() * this.images.length/3);
     
            while(this.currentIDs.filter(item => item == imageRanIndex).length / maxCapacity * 100 >= 30){
                imageRanIndex = Math.floor(math.random() * this.images.length/3);
            } 
            this.currentIDs.push(imageRanIndex);
            
            this.attachIDs(imageRanIndex);
            this.attachIDs(imageRanIndex);
        }
    }

    attachIDs(imageRanIndex){
        let ranX = Math.floor(math.random() * this.width);
        let ranY = Math.floor(math.random() * this.height);
        while(this.slots[ranX][ranY].ID != -1){
            ranX = Math.floor(math.random() * this.width);
            ranY = Math.floor(math.random() * this.height); 
        }
        
        this.slots[ranX][ranY].Init(this.slots[ranX][ranY].node.worldPosition,imageRanIndex, this.images[imageRanIndex]);
    }

    convertScreenToUI(screenPos: Vec3): Vec3 {
        const uiPos = new Vec3();

        // Lấy kích thước của canvas
        const canvasSize = view.getVisibleSize();

        // Chuyển đổi tọa độ màn hình sang tọa độ trong canvas
        const x = screenPos.x - canvasSize.width / 2;
        const y = screenPos.y - canvasSize.height / 2;

        uiPos.set(x, y, 0);
        return uiPos;
    }

    selectSlot(slotHandle: SlotHandle){
       
        if(this.currentSelect[0] == null){ 
            this.currentSelect[0] = slotHandle;
            slotHandle.selected();
            return;
        }
      
        if(this.currentSelect[0].Pos == slotHandle.Pos){
            this.resetCurrentSelects();
            return;
        }
        
        if(this.currentSelect[0].ID != slotHandle.ID){
            this.resetCurrentSelects();
            return;
        }
        
        this.currentSelect[1] = slotHandle;
        slotHandle.selected();
       
        if( this.checkStraight([this.currentSelect[0].Pos,this.currentSelect[1].Pos]).isOke){
            //
            console.log("Connect straight");
            let h1 = this.convertScreenToUI( this.cam.worldToScreen(new Vec3(this.currentSelect[0].Pos.x,this.currentSelect[0].Pos.y)) );
            let h2 = this.convertScreenToUI( this.cam.worldToScreen(new Vec3(this.currentSelect[1].Pos.x,this.currentSelect[1].Pos.y)) );

            let realPos;
            let h3 = this.camCanvas.convertToUINode(this.cam.worldToScreen(new Vec3(this.currentSelect[0].Pos.x,this.currentSelect[0].Pos.y)),this.lineCtrl.node,realPos)
            this.lineCtrl.node.setWorldPosition(h3);
             
            this.graphics.moveTo(h1.x, h1.y); 
            this.graphics.lineTo(h2.x, h2.y);    
            this.graphics.stroke();  

            this.correctDel();
            return;
        } 
       
        if( this.checkOneBreak([this.currentSelect[0].Pos,this.currentSelect[1].Pos]).isOke){
            //
            console.log("Connect one break");
            this.correctDel();
            return;
        }

        if( this.check2Breaks().isOke){
            //
            console.log("Connect 2 break");
            this.correctDel();
            return;
        }

        this.resetCurrentSelects();
        console.log("Cant connect break");
    }

    checkStraight(currentSelect){
        console.log(`check straight ${currentSelect[0]}-${currentSelect[1]}`);
        if(currentSelect[0].x === currentSelect[1].x){
            let X = currentSelect[0].x;
            let tmpY = currentSelect[0].y - currentSelect[1].y;
            let minY = tmpY < 0 ? currentSelect[0].y : currentSelect[1].y
            for(let i = minY+1; i < minY+Math.abs(tmpY); i++ ){
                
                if(this.slots[X] !== undefined && this.slots[X][i] !== null && this.slots[X][i] !== undefined)
                    return {isOke: false};
            }
            console.log(`${currentSelect[0]}-${currentSelect[1]} connect straight`);
            return {isOke: true};
        }

        if(currentSelect[0].y === currentSelect[1].y){
            let Y = currentSelect[0].y;
            let tmpX = currentSelect[0].x - currentSelect[1].x;
            let minX = tmpX < 0 ? currentSelect[0].x : currentSelect[1].x
            
            for(let i = minX+1; i < minX+ Math.abs(tmpX); i++ ){
             
                if(this.slots[i] !== undefined && this.slots[i][Y] !== null && this.slots[i][Y] !== undefined)
                    return {isOke: false};
            }
            console.log(`${currentSelect[0]}-${currentSelect[1]} connect straight`);
            return {isOke: true};
        }

        return {isOke: false};

    }

    checkOneBreak(currentSelect){
      
        let pos1 = currentSelect[0];
        let pos2 = currentSelect[1];
        console.log(`check 1 break ${pos1}-${pos2}`);
       
        if(this.checkStraight(currentSelect).isOke  ){
            return {isOke: true,points:[]};
        }

        let tmpBreaks = [null,null];
         
        tmpBreaks[0] = this.slots[pos1.x] === undefined || this.slots[pos1.x][pos2.y] === undefined? null: this.slots[pos1.x][pos2.y];
        tmpBreaks[1] = this.slots[pos2.x] === undefined || this.slots[pos2.x][pos1.y] === undefined? null: this.slots[pos2.x][pos1.y];
 
        if(tmpBreaks[0] !== null && tmpBreaks[1] !== null){ 
            return {isOke: false};
        }

        if(tmpBreaks[0] === null || tmpBreaks[0] === undefined){
            
            if(this.checkStraight([new Vec2(pos1.x,pos2.y),currentSelect[0]]).isOke && this.checkStraight([new Vec2(pos1.x,pos2.y),currentSelect[1]]).isOke ){
               
                return {isOke: true,points:[new Vec2(pos1.x,pos2.y)]};
            }
        }

        if(tmpBreaks[1] === null || tmpBreaks[1] === undefined){
           
            if(this.checkStraight([new Vec2(pos2.x,pos1.y),currentSelect[0]]).isOke && this.checkStraight([new Vec2(pos2.x,pos1.y),currentSelect[1]]).isOke ){
               
                return {isOke: true,points:[new Vec2(pos2.x,pos1.y)]};
            }
        }

        return {isOke: false};
    }
    check2Breaks(){
        console.log(`check 2 breaks ${this.currentSelect[0].Pos} -- ${this.currentSelect[1].Pos}`)
        let X = this.currentSelect[0].Pos.x;
        let Y = this.currentSelect[0].Pos.y;
 
        for(let y = -1; y <= this.height; y++){
            if(this.slots[X][y] !== undefined && this.slots[X][y] !== null)
                continue;
            if(!this.checkStraight([new Vec2(X,y), this.currentSelect[0].Pos]).isOke){
                continue;
            }
            let check1 = this.checkOneBreak([new Vec2(X,y), this.currentSelect[1].Pos]);
            if(check1.isOke){
                check1.points.push(new Vec2(X,y));
                return {isOke: true, points: check1.points};
            }
        }

        for(let x = -1; x <= this.width; x++){
            if(this.slots[x] != undefined && this.slots[x][Y] != null)
                continue;
            if(!this.checkStraight([new Vec2(x,Y), this.currentSelect[0].Pos]).isOke){
                continue;
            }
            let check1 = this.checkOneBreak([new Vec2(x,Y), this.currentSelect[1].Pos]);
            if(check1.isOke){
                check1.points.push(new Vec2(x,Y));
                return {isOke: true, points: check1.points}; 
            }
        }

        return {isOke: false};
    }

    correctDel(){
        this.setNullSlot(0);
        this.setNullSlot(1);
    }

    setNullSlot(id){
        if(this.currentSelect[id] != null){
            let tmp = this.currentSelect[id].Pos;
            this.currentSelect[id].node.destroy();
            this.currentSelect[id] = null;
            this.slots[tmp.x][tmp.y] = null; 
        }

        this.currentSelect[id] = null;
    }

    resetCurrentSelects(){
        if(this.currentSelect[0] != null){
            this.currentSelect[0].reseSelect();
            this.currentSelect[0] = null;
        }

        if(this.currentSelect[1] != null){
            this.currentSelect[1].reseSelect();
            this.currentSelect[1] = null;
        }
    }
}

