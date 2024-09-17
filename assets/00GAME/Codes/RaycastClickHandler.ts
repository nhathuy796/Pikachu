import { _decorator, Component, Camera, Vec2, PhysicsSystem, geometry, Node, EventMouse, input, Input, EventTouch, PhysicsSystem2D, Vec3, ERaycast2DType, EventKeyboard, KeyCode } from 'cc';
import { SlotManager } from './SlotManager';
import { SlotHandle } from './SlotHandle';
const { ccclass, property } = _decorator;

@ccclass('RaycastClickHandler')
export class RaycastClickHandler extends Component {

    @property(Camera)
    cam: Camera = null;  // Camera chính để thực hiện raycast

    onEnable() {
        // Đăng ký sự kiện chuột khi component được kích hoạt
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onDisable() {
        // Gỡ bỏ sự kiện khi component bị vô hiệu hóa
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    } 

    onMouseDown(event: EventMouse) {
        const mousePos = event.getLocation();   
        this.checkRaycast(mousePos);
    }
 

    checkRaycast(mousePos: Vec2) {
        // Chuyển đổi vị trí chuột thành không gian thế giới
        const worldPos = this.cam.screenToWorld(new Vec3(mousePos.x, mousePos.y));
    
        // Kiểm tra va chạm tại vị trí worldPos
        const collider = PhysicsSystem2D.instance.testPoint(new Vec2(worldPos.x,worldPos.y));
    
        if (collider.length > 0) {
            SlotManager.getInstance<SlotManager>().selectSlot(collider[0].node.getComponent(SlotHandle));
            console.log("Đã click vào node:", collider[0].node.name);
        } else {
            console.log("Không có đối tượng nào bị click.");
            SlotManager.getInstance<SlotManager>().resetCurrentSelects();
        }
    }
    
}
