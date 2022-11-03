import { Player } from "../player/base.js";
import {GIF} from '../utils/gif.js'

export class Kyo extends Player {
  constructor(root, info) {
    super(root, info);

    this.init_animations();   // 初始化动画
  }

  init_animations() {
    let outer = this;
    let offsets = [0, -22, -22, -150, 0, 0, 0];   // 偏移量
    for (let i = 0; i < 7; ++ i) {  // 7个动作
      let gif = GIF();
      gif.load(`/static/images/player/kyo/${i}.gif`);
      this.animations.set(i, {  // 动画
        gif: gif,
        frame_cnt: 0,  // GIF帧数
        frame_rate: 5,  // 每秒的帧数
        offset_y: offsets[i],  // y方向偏移量
        loaded: false,  // 是否加载完成
        scale: 2,  // 放大2倍
      });

      gif.onload = function() {   // 加载完成
        let obj = outer.animations.get(i);
        obj.frame_cnt = gif.frames.length;
        obj.loaded = true;

        if (i === 3) {
          obj.frame_rate = 4;
        }
      }
    }
  }
}