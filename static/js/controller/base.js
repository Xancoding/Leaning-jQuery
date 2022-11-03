export class Controller {   // 手动实现键盘触发事件——当前按住的按键（效果不同于keydown）
  constructor($canvas) {
    this.$canvas = $canvas;
    
    this.pressed_keys = new Set();    // Set 对象允许你存储任何类型的唯一值
    this.start();
  }

  start() {
    let outer = this;
    this.$canvas.keydown(function(e){   // keydown：某个键是否被按住，事件会连续触发
      outer.pressed_keys.add(e.key);
    });

    this.$canvas.keyup(function(e){   // keyup：某个按键是否被释放
      outer.pressed_keys.delete(e.key);
    });

    
  }
}