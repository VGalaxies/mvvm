// 公众号对象
class eventEmitter {
  list: object;
  on: Function;
  emit: Function;
}

const emitter = new eventEmitter();
// 缓存列表，存放 event 及 fn
emitter.list = {};

// 订阅
emitter.on = function (event: string, fn: Function) {
  let _this = this;
  // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
  // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
  (_this.list[event] || (_this.list[event] = [])).push(fn);
  return _this;
};

// 发布
emitter.emit = function (event: string, ...args: any) {
  let _this = this;
  // 第一个参数是对应的 event 值
  let fns = _this.list[event];
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
};

function foo(content: string) {
  console.log(`foo <- ${content}`);
}

function bar(content: string) {
  console.log(`bar <- ${content}`);
}

function add(x: number, y: number) {
  console.log(`${x} + ${y} = ${x + y}`);
}

function sub(x: number, y: number) {
  console.log(`${x} - ${y} = ${x - y}`);
}

// 订阅
emitter.on("article", foo);
emitter.on("article", bar);
emitter.on("math", add);
emitter.on("math", sub);

// 发布
emitter.emit("article", "hello world");
emitter.emit("math", 1, 2);
emitter.emit("math", 300, 120);
