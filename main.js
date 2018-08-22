import {ResourceLoader} from "./js/base/ResourceLoader.js";
import {DataStore} from "./js/base/DataStore.js";
import {BackGround} from "./runtime/BackGround.js";
import {Pieces} from "./runtime/Pieces.js";

export default class Main {
   constructor() {
      this.width_first_position = 13;
      this.height_first_position = 300;
      this.width_height_grid = 25;
      this.width_height_chess = 350;

      this.canvas = wx.createCanvas();
      this.dataStore = DataStore.getInstance();
      this.ctx = this.canvas.getContext('2d');

      this.offCanvas = wx.createCanvas();
      this.offCtx = this.offCanvas.getContext('2d');

      const loader = ResourceLoader.create();
      loader.onLoaded(map => this.onResourceFirstLoaded(map));


   }

   onResourceFirstLoaded(map) {
      this.dataStore.canvas = this.canvas;
      this.dataStore.ctx = this.ctx;

      this.dataStore.offCanvas = this.offCanvas;
      this.dataStore.offCtx = this.offCtx;

      this.dataStore.res = map;

      this.dataStore.put('background', new BackGround());
      this.dataStore.put('blackPiece', new Pieces('blackPiece'));
      this.dataStore.put('whitePiece', new Pieces('whitePiece'));

      this.dataStore.get('background').offDraw();
      this.dataStore.get('background').draw();

      this.start();
   }

   painChess(screenContext) {
      let context = screenContext;
      context.strokeStyle = '#686868';
      context.beginPath();


      for (let i = 0; i < 15; i++) {
         context.moveTo(this.width_first_position, this.height_first_position + i * this.width_height_grid);
         context.lineTo(this.width_first_position + this.width_height_chess, this.height_first_position + i * this.width_height_grid);

         context.moveTo(this.width_first_position + i * this.width_height_grid, this.height_first_position);
         context.lineTo(this.width_first_position + i * this.width_height_grid, this.height_first_position + this.width_height_chess);
         context.stroke();
      }
   }

   initChess(chessBoard, wins, myWin, computerWin) {
      let count = 0;

      //数组显示棋盘
      for (let i = 0; i < 15; i++) {
         chessBoard[i] = [];
         for (let j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
         }
      }

      //初始化一下赢法数组
      for (let i = 0; i < 15; i++) {
         wins[i] = [];
         for (let j = 0; j < 15; j++) {
            wins[i][j] = [];
         }
      }

      for (let i = 14; i >= 4; i--) {// 斜着赢的/
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               wins[i - k][j + k][count] = true
            }
            count++;
         }
      }


      for (let i = 0; i < 11; i++) {// 斜着赢的\
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               wins[i + k][j + k][count] = true;
            }
            count++;
         }
      }


      for (let i = 0; i < 11; i++) {//计算竖着的
         for (let j = 0; j < 15; j++) {
            for (let k = 0; k < 5; k++) {
               wins[i + k][j][count] = true;
            }
            count++;
         }
      }


      for (let i = 0; i < 15; i++) { //计算横着的
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               //console.log(wins)
               wins[i][j + k][count] = true;
               //0 -10
            }
            count++;
         }
      }


      //console.log(count);

      for (let i = 0; i < count; i++) {
         myWin[i] = 0;
         computerWin[i] = 0;
      }
      //console.log(chessBoard);

      return count;
   }

   clickChessPiece(chess, chessBoard, i, j, flag, color) {
      let spritePiece = null;
      let image = null;
      if (color === 'white') {
         spritePiece = this.dataStore.get('whitePiece');
         image = this.dataStore.res.get('whitePiece');
      } else {
         spritePiece = this.dataStore.get('blackPiece');
         image = this.dataStore.res.get('blackPiece');
      }

      spritePiece.offDraw(
        image,
        0,
        0,
        image.width,
        image.height,
        this.width_first_position + i * this.width_height_grid - this.width_height_grid / 2.1,
        this.height_first_position + j * this.width_height_grid - this.width_height_grid / 2.1,
        image.width * 0.7,
        image.height * 0.7
      );

      this.ctx.drawImage(this.offCanvas, 0, 0);

      chessBoard[i][j] = flag;
   }

   clickChessPieceOld(chess, chessBoard, i, j, flag, first_color, second_color) {
      // console.log(i, j);
      let context = this.ctx;
      context.beginPath();
      context.arc(
        this.width_first_position + i * this.width_height_grid,
        this.height_first_position + j * this.width_height_grid,
        10,
        0,
        2 * Math.PI
      );

      let grd = context.createRadialGradient(
        this.width_first_position + i * this.width_height_grid,
        this.height_first_position + j * this.width_height_grid,
        10,
        this.width_first_position + i * this.width_height_grid + 1,
        this.height_first_position + j * this.width_height_grid - 1,
        0
      );

      grd.addColorStop(0, first_color);
      grd.addColorStop(1, second_color);
      context.fillStyle = grd;
      context.fill();
      context.stroke();

      chessBoard[i][j] = flag;
   }

   computerAI(chess, chessBoard, wins, myWin, computerWin, count) {
      let myScore = [];
      let computerScore = [];

      let max = 0;
      let u = 0, v = 0;

      for (let i = 0; i < 15; i++) {
         myScore[i] = [];
         computerScore[i] = [];
         for (let j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
         }
      }

      for (let i = 0; i < 15; i++) {
         for (let j = 0; j < 15; j++) {
            if (chessBoard[i][j] === 0) {
               for (let k = 0; k < count; k++) {
                  if (wins[i][j][k]) {
                     switch (myWin[k]) {
                        case 1:
                           myScore[i][j] += 200;
                           break;
                        case 2:
                           myScore[i][j] += 500;
                           break;
                        case 3:
                           myScore[i][j] += 2000;
                           break;
                        case 4:
                           myScore[i][j] += 10000;
                           break;
                     }

                     switch (computerWin[k]) {
                        case 1 :
                           computerScore[i][j] += 220;
                           break;
                        case 2 :
                           computerScore[i][j] += 520;
                           break;
                        case 3:
                           computerScore[i][j] += 2200;
                           break;
                        case 4:
                           computerScore[i][j] += 20000;
                           break;
                     }
                  }


               }


               if (myScore[i][j] > max) {
                  max = myScore[i][j];
                  u = i;
                  v = j;
               } else if (myScore[i][j] === max) {
                  if (computerScore[i][j] > computerScore[u][v]) {
                     u = i;
                     v = j;
                  }
               }

               //进攻

               if (computerScore[i][j] > max) {
                  max = computerScore[i][j];
                  u = i;
                  v = j;
               }
               else if (computerScore[i][j] === max) {
                  if (myScore[i][j] > myScore[u][v]) {
                     u = i;
                     v = j;
                  }
               }
            }
         }
      }

      console.log(computerScore, myScore);
      console.log('电脑落子：');
      console.log(u, v);

      //落子
      this.clickChessPiece(chess, chessBoard, u, v, 2, 'white');


      for (let k = 0; k < count; k++) {
         if (wins[u][v][k]) {
            computerWin[k]++;
            if (computerWin[k] === 5) {
               console.log('电脑赢了');
            }
         }
      }
   }

   listenTouch(chess, chessBoard, wins, myWin, computerWin, count){
      wx.onTouchStart((e) => {
         console.log(e.touches);
         console.log(e.touches[0]['clientX']);
         console.log(e.touches[0]['clientY']);

         let client_x = e.touches[0]['clientX'];
         let client_y = e.touches[0]['clientY'];

         let i = Math.floor((client_x - this.width_first_position + this.width_height_grid / 2) / this.width_height_grid);
         let j = Math.floor((client_y - this.height_first_position + this.width_height_grid / 2) / this.width_height_grid);
         console.log(i, j);
         if (chessBoard[i][j] === 1) {
            //alert('哥们那有字了')
            return;
         }

         //离屏显示到主屏
         this.ctx.drawImage(this.offCanvas, 0, 0);

         //落子
         this.clickChessPiece(chess, chessBoard, i, j, 1, 'black');

         //console.log(chessBoard);

         for (let k = 0; k < count; k++) {
            if (wins[i][j][k]) {
               myWin[k]++;
            }
            if (myWin[k] === 5) {
               console.log('你真厉害了～')
            }
            //myWin[k]++;

         }
         //console.log(myWin)

         this.computerAI(chess, chessBoard, wins, myWin, computerWin, count);
      });
   }

   listenShow(){
      wx.onShow(res => { //这里并非运行在主线程,如果在这里写绘制的代码,就会发生灵异事件,正确的写法是
         setTimeout( () => {
            this.start();
         }, 500)})
   }

   start() {
      // document.body.innerHTML = '<canvas id="chess" width="375" height="667"></canvas>';
      // let chess = document.getElementById('chess');
      let chess = this.canvas;

      let chessBoard = [];

      //赢法数组
      let wins = [];

      //一共有多少种赢法
      let count = 0;

      //赢法统计数组
      let myWin = [];

      //电脑的赢法数组
      let computerWin = [];

      // 绘制棋盘
      this.painChess(this.ctx);
      this.painChess(this.offCtx);

      // 初始化核心数据
      count = this.initChess(chessBoard, wins, myWin, computerWin);


      // 监听触摸事件
      this.listenTouch(chess, chessBoard, wins, myWin, computerWin, count);

      // 监听小游戏从后台切换到前台的事件
      // this.listenShow();
   }
}



