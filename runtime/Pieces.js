//棋子
import {Sprite} from "../js/base/Sprite.js";

export class Pieces extends Sprite {
   constructor(pieceColor) {
      const image = Sprite.getImage(pieceColor);
      super(image,
        0, 0,
        image.width, image.height,
        0, 0,
        image.width, image.height);
   }
}