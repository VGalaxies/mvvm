export class EventEmitter {
  // 缓存列表，存放 event 及 fn
  private list: any = {};

  public on: Function = (event: string, fn: Fn) => {
    const _this = this;
    // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
    // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
    (_this.list[event] || (_this.list[event] = [])).push(fn);
    return _this;
  };

  public emit: Function = (event: string, ...args: any) => {
    const _this = this;
    // 第一个参数是对应的 event 值
    const fns = _this.list[event];
    // 如果缓存列表里没有 fn 就返回 false
    if (!fns || fns.length === 0) {
      return false;
    }
    // 遍历 event 值对应的缓存列表，依次执行 fn
    fns.forEach((fn: { apply: (arg0: any, arg1: any) => void }) => {
      fn.apply(_this, args);
    });
    return _this;
  };

  public off: Function = (event: string, fn: Function) => {
    const _this = this;
    let fns = _this.list[event];
    // 如果缓存列表中没有相应的 fn，返回 false
    if (!fns || fns.length === 0) {
      return false;
    }
    // 遍历缓存列表，看看传入的 fn 与哪个函数相同，如果相同就直接从缓存列表中删掉即可
    _this.list[event] = fns.filter((fb: Fn) => {
      return fb !== fn && fb.fn !== fn;
    });
    return _this;
  };

  public once: Function = (event: string, fn: Function) => {
    // 先绑定，调用后删除
    let _this = this;
    function on() {
      _this.off(event, on);
      fn.apply(_this, arguments);
    }
    on.fn = fn; // for off
    _this.on(event, on);
    return _this;
  };
}

interface Fn extends Function {
  fn?: Function;
}
