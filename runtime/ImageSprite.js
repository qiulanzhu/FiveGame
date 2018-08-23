import {Sprite} from "../js/base/Sprite.js";

export class ImageSprite extends Sprite {
   constructor(imageName) {
      const image = Sprite.getImage(imageName);
      super(image,
        0, 0,
        image.width, image.height,
        100, 100,
        image.width, image.height);
   }
}