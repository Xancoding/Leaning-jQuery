import { AcGameObject } from '/static/js/ac_game_object/base.js';

export class Player extends AcGameObject {
  constructor(root, info) {
    super();

    this.root = root;
    this.id = info.id;
    this.x = info.x;
    this.y = info.y;
    this.width = info.width;
    this.height = info.height;
    this.color = info.color;

    this.direction = 1;

    this.vx = 0;
    this.vy = 0;

    this.speedx = 400;  //水平速度
    this.speedy = -1000;  //跳跃初始速度

    this.gravity = 50;

    this.ctx = this.root.game_map.ctx;
    this.pressed_keys = this.root.game_map.controller.pressed_keys;
    this.status = 3;  //0：静止， 1：向前，2：向后，3：跳跃，4：攻击，5：被攻击，6：死亡
    this.animations = new Map();
    this.frame_current_cnt = 0;  //当前记录帧数

    this.hp = 100;
    this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
    this.$hp_div = this.$hp.find('div');
  }
  start() {
    
  }

  update_control() {
    let w, a, d, space;
    if (this.id === 0) {
      w = this.pressed_keys.has('w');
      a = this.pressed_keys.has('a');
      d = this.pressed_keys.has('d');
      space = this.pressed_keys.has(' ');
    } else {
      w = this.pressed_keys.has('ArrowUp');
      a = this.pressed_keys.has('ArrowLeft');
      d = this.pressed_keys.has('ArrowRight');
      space = this.pressed_keys.has('Enter');
    }

    if (this.status === 0 || this.status === 1) {
      if (space) {  //攻击
        this.status = 4;
        this.vx = 0;
        this.frame_current_cnt = 0;
      } else if (w) {  //跳跃
        if (d) {  //向右跳
          this.vx = this.speedx;
        } else if (a) {  //向左跳
          this.vx = -this.speedx;
        } else {  //原地跳
          this.vx = 0;
        }
        this.vy = this.speedy;
        this.status = 3;
        this.frame_current_cnt = 0;

      } else if (d) {  //向右移动
        this.vx = this.speedx;
        this.status = 1;
      } else if (a) {  //向左移动
        this.vx = -this.speedx;
        this.status = 1;
      } else {  //静止
        this.vx = 0;
      }
    }

  }
  
  update_move() {
    this.vy += this.gravity;

    this.x += this.vx * this.timedelta / 1000;
    this.y += this.vy * this.timedelta / 1000;

    let [a, b] = this.root.players;
    if (a !== this) [a,b] = [b, a];

    let r1 = {
      x1: a.x,
      y1: a.y,
      x2: a.x + a.width,
      y2: a.x + a.height,
    };
    let r2 = {
      x1: b.x, 
      y1: b.y,
      x2: b.x + b.width,
      y2: b.x + b.height,
    };

    if (this.is_collusion(r1, r2)) {
      b.x += this.vx * this.timedelta / 1000 / 2;
      b.y += this.vy * this.timedelta / 1000 / 2;
      a.x -= this.vx * this.timedelta / 1000 / 2;
      a.y -= this.vy * this.timedelta / 1000 / 2;

      if (this.status === 3) this.status = 0;
    }

    if (this.y > 450) {
      this.y = 450;
      this.vy = 0;
      if (this.status === 3) this.status = 0;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
      this.x = this.root.game_map.$canvas.width() - this.width;
    }
  }

  update_direction() {
    if (this.status === 6) return;

    let players = this.root.players;
    if (players[0] && players[1]) {
      let me = this, you = players[1 - this.id];
      if (me.x < you.x) me.direction = 1;
      else me.direction = -1;
    }
  }

  is_collusion(r1, r2) {  //判断两个矩阵是否有交集
    if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
      return false;
    if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2,r2.y2))
      return false;
    return true; 
  }

  is_attack() {
    if (this.status === 6) return;

    this.status = 5;
    this.frame_current_cnt = 0;

    this.hp = Math.max(this.hp - 10, 0);

    this.$hp_div.animate({  
      width: this.$hp.parent().width() * this.hp / 100,
    }, 350);

    this.$hp.animate({  
      width: this.$hp.parent().width() * this.hp / 100,
    }, 600);

    if (this.hp <= 0) {
      this.status = 6;
      this.frame_current_cnt = 0;
      this.vx = 0;
    }
  }

  update_attack() {
    if (this.status === 4 && this.frame_current_cnt === 18) {
      let me = this, you = this.root.players[1 - this.id];
      let r1;  //攻击判定矩形
      let r2;  //敌方人物矩形
      if (this.direction >0) {
        r1 = {
          x1: me.x + 120,
          y1: me.y + 40,
          x2: me.x + 120 + 100,
          y2: me.y + 40 + 20,
        }
      } else {
        r1 = {
          x1: me.x + me.width - 120 - 100,
          y1: me.y + 40,
          x2: me.x + me.width - 120 - 100 + 100,
          y2: me.y + 40 + 20,
        }
      }

      r2 = {
        x1: you.x,
        y2: you.y,
        x2: you.x + you.width,
        y2: you.y + you.height
      };

      if (this.is_collusion(r1, r2)) {
        you.is_attack();
      }
    }
  }

  update() {
    this.update_attack();
    this.update_direction();
    this.update_control();
    this.update_move();
    
    this.render();
  }

  render() {

    let status = this.status;

    if (this.status === 1 && this.direction * this.vx < 0) status = 2;

    let obj = this.animations.get(status);
    if (obj && obj.loaded) {
      if (this.direction > 0) {  //正方向
        let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
        let image = obj.gif.frames[k].image;
        this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
      } else {  //反方向
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

        let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
        let image = obj.gif.frames[k].image;
        this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.width - this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

        this.ctx.restore();
      }
    }

    if (status === 4 || status === 5 || status === 6) {  //确保不会一直循环GIF
      if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
        if (status === 6) {
          this.frame_current_cnt--;
        } else {
          this.status = 0;
        }
        
      }
    }

    this.frame_current_cnt++;
  }
}
