import {Sprite} from "../js/base/Sprite.js";

export class Image extends Sprite {
   constructor(imageName) {
      const image = Sprite.getImage(imageName);
      super(image,
        0, 0,
        image.width, image.height,
        100, 100,
        image.width*0.3, image.height*0.3);
   }
}