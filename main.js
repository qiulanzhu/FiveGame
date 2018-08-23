import {ResourceLoader} from "./js/base/ResourceLoader.js";
import {DataStore} from "./js/base/DataStore.js";
import {BackGround} from "./runtime/BackGround.js";
import {ImageSprite} from "./runtime/ImageSprite.js";

export default class Main {
   constructor() {
      // 棋盘画线参数
      this.width_first_position = 20;
      this.height_first_position = 200;
      this.width_height_grid = 23;
      this.width_height_chess = 14 * this.width_height_grid;

      // 总的数据存储
      this.dataStore = DataStore.getInstance();

      // 主屏和离屏
      this.canvas = wx.createCanvas();
      this.ctx = this.canvas.getContext('2d');
      this.offCanvas = wx.createCanvas();
      this.offCtx = this.offCanvas.getContext('2d');

      // 棋盘是否放子
      // 赢法数组
      // 一共有多少种赢法
      // 赢法统计数组
      // 电脑的赢法数组
      this.chessBoard = [];
      this.wins = [];
      this.count = 0;
      this.myWin = [];
      this.computerWin = [];

      // 资源加载
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
      this.dataStore.put('blackPiece', new ImageSprite('blackPiece'));
      this.dataStore.put('whitePiece', new ImageSprite('whitePiece'));
      this.dataStore.put('blackWin', new ImageSprite('blackWin'));
      this.dataStore.put('whiteWin', new ImageSprite('whiteWin'));
      this.dataStore.put('fiveChess', new ImageSprite('fiveChess'));

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

   painRedRim(screenContext, x, y, width, height){
      let context = screenContext;
      context.strokeStyle = '#ff0000';
      context.beginPath();


      for (let i = 0; i < 15; i++) {
         context.moveTo(x, y);
         context.lineTo(x + width, y);
         context.lineTo(x + width, y + height);
         context.lineTo(x , y + height);
         context.lineTo(x , y);
         context.stroke();
      }
   }

   initChess() {
      let count = 0;

      //数组显示棋盘
      for (let i = 0; i < 15; i++) {
         this.chessBoard[i] = [];
         for (let j = 0; j < 15; j++) {
            this.chessBoard[i][j] = 0;
         }
      }

      //初始化一下赢法数组
      for (let i = 0; i < 15; i++) {
         this.wins[i] = [];
         for (let j = 0; j < 15; j++) {
            this.wins[i][j] = [];
         }
      }

      for (let i = 14; i >= 4; i--) {// 斜着赢的/
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               this.wins[i - k][j + k][count] = true
            }
            count++;
         }
      }


      for (let i = 0; i < 11; i++) {// 斜着赢的\
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               this.wins[i + k][j + k][count] = true;
            }
            count++;
         }
      }


      for (let i = 0; i < 11; i++) {//计算竖着的
         for (let j = 0; j < 15; j++) {
            for (let k = 0; k < 5; k++) {
               this.wins[i + k][j][count] = true;
            }
            count++;
         }
      }


      for (let i = 0; i < 15; i++) { //计算横着的
         for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
               //console.log(wins)
               this.wins[i][j + k][count] = true;
               //0 -10
            }
            count++;
         }
      }


      //console.log(count);

      for (let i = 0; i < count; i++) {
         this.myWin[i] = 0;
         this.computerWin[i] = 0;
      }
      //console.log(chessBoard);

      return count;
   }

   clickChessPiece(i, j, flag, color) {
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

      this.painRedRim(
        this.ctx,
        this.width_first_position + i * this.width_height_grid - this.width_height_grid / 2.1,
        this.height_first_position + j * this.width_height_grid - this.width_height_grid / 2.1,
        image.width * 0.7,
        image.height * 0.7
      );

      this.chessBoard[i][j] = flag;
   }

   clickChessPieceOld(i, j, flag, first_color, second_color) {
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

      this.chessBoard[i][j] = flag;
   }

   computerAI() {
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
            if (this.chessBoard[i][j] === 0) {
               for (let k = 0; k < this.count; k++) {
                  if (this.wins[i][j][k]) {

                     if(this.myWin[k] !== 0 && this.computerWin[k] === 0){
                        switch (this.myWin[k]) {
                           case 1:
                              myScore[i][j] += 100;
                              break;
                           case 2:
                              myScore[i][j] += 1500;
                              break;
                           case 3:
                              myScore[i][j] += 3000;
                              break;
                           case 4:
                              myScore[i][j] += 100000;
                              break;
                        }
                     }

                     if(this.computerWin[k] !== 0 &&  this.myWin[k] === 0){
                        switch (this.computerWin[k]) {
                           case 1 :
                              computerScore[i][j] += 102;
                              break;
                           case 2 :
                              computerScore[i][j] += 1520;
                              break;
                           case 3:
                              computerScore[i][j] += 20000;
                              break;
                           case 4:
                              computerScore[i][j] += 100000;
                              break;
                        }
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
      this.clickChessPiece(u, v, 2, 'white');


      for (let k = 0; k < this.count; k++) {
         if (this.wins[u][v][k]) {
            this.computerWin[k]++;
            if (this.computerWin[k] === 5) {
               // this.dataStore.get('whiteWin').draw();
               console.log('电脑赢了');

               wx.showModal({
                  title: '游戏结束!',
                  content: 'AI WIN!',
                  showCancel: false,
                  cancelText: '取消',
                  cancelColor: '#000000',
                  confirmText: '再来一局',
                  confirmColor: '#3cc51f',
                  success: (e) => {
                     this.start();
                  },
                  fail: (e) => {
                     this.start();
                  }
               })
            }
         }
      }
   }

   listenTouch(){
      wx.onTouchStart((e) => {
         console.log(e.touches);
         console.log(e.touches[0]['clientX']);
         console.log(e.touches[0]['clientY']);

         let client_x = e.touches[0]['clientX'];
         let client_y = e.touches[0]['clientY'];

         let i = Math.floor((client_x - this.width_first_position + this.width_height_grid / 2) / this.width_height_grid);
         let j = Math.floor((client_y - this.height_first_position + this.width_height_grid / 2) / this.width_height_grid);
         console.log(i, j);

         // 边界判断
         if(i < 0 || i > 14 || j < 0 || j >　14){
            return;
         }

         // 判断是否下过子
         if (this.chessBoard[i][j] === 1) {
            return;
         }

         //落子
         this.clickChessPiece(i, j, 1, 'black');

         //console.log(chessBoard);

         for (let k = 0; k < this.count; k++) {
            if (this.wins[i][j][k]) {
               this.myWin[k]++;
            }
            if (this.myWin[k] === 5) {
               // this.dataStore.get('blackWin').offDraw();
               // this.ctx.drawImage(this.offCanvas, 0, 0);
               console.log('你真厉害了～');

               wx.showModal({
                  title: '游戏结束!',
                  content: '大侠，你赢啦！',
                  showCancel: false,
                  cancelText: '取消',
                  cancelColor: '#000000',
                  confirmText: '再来一局',
                  confirmColor: '#3cc51f',
                  success: (e) => {
                     this.start();
                  },
                  fail: (e) => {
                     this.start();
                  }
               })
            }
            //myWin[k]++;

         }
         //console.log(myWin)

         this.computerAI();
      });
   }

   listenShow(){
      wx.onShow(res => {
         this.ctx.drawImage(this.offCanvas, 0, 0);
      })
   }

   initLayout(){
      // 添加背景图
      this.dataStore.get('background').offAndMainDraw();

      // 添加棋盘图
      let image = this.dataStore.res.get('fiveChess');
      this.dataStore.get('fiveChess').offAndMainDraw(
        image,
        0,
        0,
        image.width,
        image.height,
        5,
        this.height_first_position - 25,
        this.canvas.width - 10,
        this.canvas.width + this.width_height_grid/2
      );

      // 绘制棋盘
      this.painChess(this.ctx);
      this.painChess(this.offCtx);
   }

   start() {
      // 初始化布局
      this.initLayout();

      // 初始化核心数据
      this.count = this.initChess();

      // 监听触摸事件
      this.listenTouch();

      // 监听小游戏从后台切换到前台的事件
      this.listenShow();
   }
}



