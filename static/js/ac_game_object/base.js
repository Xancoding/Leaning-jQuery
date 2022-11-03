let AC_GAME_OBJECTS = [];

export class AcGameObject {
  constructor() {
    AC_GAME_OBJECTS.push(this);

    this.timedelta = 0;
    this.has_call_start = false;
  }

  start() {  // 初始化


  }

  update() {  // 每一帧执行一次

  }

  destory() {  // 删除当前对象
    for (let i in AC_GAME_OBJECTS) {
      if (AC_GAME_OBJECTS[i] === this) {
        AC_GAME_OBJECTS.splice(i, 1);
        break;
      }
    }
  }
}

let last_timestamp;   // 上一次执行函数时的时刻

/**
 * @description 该函数每一帧执行一次
 * @param {number} timestamp 当前执行函数时的时刻
 */

let AC_GAME_OBJECTS_FRAME = (timestamp) => {
  for (let obj of AC_GAME_OBJECTS) {
    if (!obj.has_call_start) {
      obj.start();
      obj.has_call_start = true;
    } else {
      obj.timedelta = timestamp - last_timestamp;
      obj.update();
    }
  }

  last_timestamp = timestamp;
  requestAnimationFrame(AC_GAME_OBJECTS_FRAME);
}

requestAnimationFrame(AC_GAME_OBJECTS_FRAME);
