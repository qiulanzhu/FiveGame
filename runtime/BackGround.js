//背景
import {Sprite} from "../js/base/Sprite.js";
import {DataStore} from "../js/base/DataStore.js";

export class BackGround extends Sprite {
    constructor() {
        const image = Sprite.getImage('background');
        super(image,
            0, 0,
            image.width, image.height,
            0, 0,
            DataStore.getInstance().canvas.width, DataStore.getInstance().canvas.height);
    }
}