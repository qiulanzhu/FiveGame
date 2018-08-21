//棋子
import {Sprite} from "../js/base/Sprite.js";
import {DataStore} from "../js/base/DataStore.js";

export class Pieces extends Sprite {
   constructor(pieceColor) {
      const image = Sprite.getImage(pieceColor);
      super(image,
        0, 0,
        image.width, image.height,
        0, 0,
        DataStore.getInstance().canvas.width, DataStore.getInstance().canvas.height);
   }
}