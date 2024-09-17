import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export namespace HuynnLib{
@ccclass('Singleton')
export class Singleton<T extends Component> extends Component {
    protected static instance: any; 

    public static getInstance<T>(): T {
        if (!this.instance) {
            this.instance = new this();       
        }

        return this.instance as T ;
    } 
}
}
