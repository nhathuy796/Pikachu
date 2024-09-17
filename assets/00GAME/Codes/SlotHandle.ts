import { _decorator, Component, Node, Sprite, SpriteFrame, SpriteRenderer, Vec2 } from 'cc';
import { SlotManager } from './SlotManager';
const { ccclass, property } = _decorator;

@ccclass('SlotHandle')
export class SlotHandle extends Component {
    @property(Number) public ID: Number = -1;
    @property(Vec2) Pos: Vec2 = new Vec2(0,0);
    @property(SpriteRenderer) icon;
    @property(SpriteRenderer) BG;

    @property(SpriteFrame) whiteSprite;
    @property(SpriteFrame) yellowSprite;

    start() {
        if(this.icon == null)
            this.icon = this.getComponentInChildren(SpriteRenderer);

        if(this.BG == null)
            this.BG = this.getComponent(SpriteRenderer);
    }

    Init(pos, id, sprite){
        this.Pos.x = pos.x;
        this.Pos.y = pos.y;
        this.ID = id;

        if(this.icon == null)
            this.icon = this.getComponentInChildren(SpriteRenderer);
        this.icon.spriteFrame = sprite;
        this.node.name = `${pos.x}_${pos.y}_ID:${id}`;
   }

   reseSelect(){
      
        this.icon.node.setParent(null);
        this.BG.spriteFrame = this.whiteSprite;
        this.icon.node.setParent(this.BG.node);
   }

   selected(){
        if(this.BG == null)
            this.BG = this.getComponent(SpriteRenderer);

        this.icon.node.setParent(null);
        this.BG.spriteFrame = this.yellowSprite;
        this.icon.node.setParent(this.BG.node);

   }
}

