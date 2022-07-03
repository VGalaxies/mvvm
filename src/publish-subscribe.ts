class EventEmitter {
  // 缓存列表，存放 event 及 fn
  private list: object;
  public on: Function;
  public emit: Function;
  constructor(_list: object, _on: Function, _emit: Function) {
    this.list = _list;
    this.on = _on;
    this.emit = _emit;
  }
}

export const emitter = new EventEmitter({}, _on, _emit);

// 订阅
function _on(event: string, fn: Function) {
  const _this = this;
  // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
  // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
  (_this.list[event] || (_this.list[event] = [])).push(fn);
  return _this;
}

// 发布
function _emit(event: string, ...args: any) {
  const _this = this;
  // 第一个参数是对应的 event 值
  const fns = _this.list[event];
  // 如果缓存列表里没有 fn 就返回 false
  if (!fns || fns.length === 0) {
    return false;
  }
  // 遍历 event 值对应的缓存列表，依次执行 fn
  // @ts-ignore
  fns.forEach((fn) => {
    fn.apply(_this, args);
  });
  return _this;
}
