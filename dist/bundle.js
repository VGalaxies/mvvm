/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
// 公众号对象
var eventEmitter = /** @class */ (function () {
    function eventEmitter() {
    }
    return eventEmitter;
}());
var emitter = new eventEmitter();
// 缓存列表，存放 event 及 fn
emitter.list = {};
// 订阅
emitter.on = function (event, fn) {
    var _this = this;
    // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
    // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
    (_this.list[event] || (_this.list[event] = [])).push(fn);
    return _this;
};
// 发布
emitter.emit = function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var _this = this;
    // 第一个参数是对应的 event 值
    var fns = _this.list[event];
    // 如果缓存列表里没有 fn 就返回 false
    if (!fns || fns.length === 0) {
        return false;
    }
    // 遍历 event 值对应的缓存列表，依次执行 fn
    // @ts-ignore
    fns.forEach(function (fn) {
        fn.apply(_this, args);
    });
    return _this;
};
function foo(content) {
    console.log("foo <- ".concat(content));
}
function bar(content) {
    console.log("bar <- ".concat(content));
}
function add(x, y) {
    console.log("".concat(x, " + ").concat(y, " = ").concat(x + y));
}
function sub(x, y) {
    console.log("".concat(x, " - ").concat(y, " = ").concat(x - y));
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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InNvdXJjZXNDb250ZW50IjpbIi8vIOWFrOS8l+WPt+WvueixoVxuY2xhc3MgZXZlbnRFbWl0dGVyIHtcbiAgbGlzdDogb2JqZWN0O1xuICBvbjogRnVuY3Rpb247XG4gIGVtaXQ6IEZ1bmN0aW9uO1xufVxuXG5jb25zdCBlbWl0dGVyID0gbmV3IGV2ZW50RW1pdHRlcigpO1xuLy8g57yT5a2Y5YiX6KGo77yM5a2Y5pS+IGV2ZW50IOWPiiBmblxuZW1pdHRlci5saXN0ID0ge307XG5cbi8vIOiuoumYhVxuZW1pdHRlci5vbiA9IGZ1bmN0aW9uIChldmVudDogc3RyaW5nLCBmbjogRnVuY3Rpb24pIHtcbiAgbGV0IF90aGlzID0gdGhpcztcbiAgLy8g5aaC5p6c5a+56LGh5Lit5rKh5pyJ5a+55bqU55qEIGV2ZW50IOWAvO+8jOS5n+WwseaYr+ivtOaYjuayoeacieiuoumYhei/h++8jOWwsee7mSBldmVudCDliJvlu7rkuKrnvJPlrZjliJfooahcbiAgLy8g5aaC5pyJ5a+56LGh5Lit5pyJ55u45bqU55qEIGV2ZW50IOWAvO+8jOaKiiBmbiDmt7vliqDliLDlr7nlupQgZXZlbnQg55qE57yT5a2Y5YiX6KGo6YeMXG4gIChfdGhpcy5saXN0W2V2ZW50XSB8fCAoX3RoaXMubGlzdFtldmVudF0gPSBbXSkpLnB1c2goZm4pO1xuICByZXR1cm4gX3RoaXM7XG59O1xuXG4vLyDlj5HluINcbmVtaXR0ZXIuZW1pdCA9IGZ1bmN0aW9uIChldmVudDogc3RyaW5nLCAuLi5hcmdzOiBhbnkpIHtcbiAgbGV0IF90aGlzID0gdGhpcztcbiAgLy8g56ys5LiA5Liq5Y+C5pWw5piv5a+55bqU55qEIGV2ZW50IOWAvFxuICBsZXQgZm5zID0gX3RoaXMubGlzdFtldmVudF07XG4gIC8vIOWmguaenOe8k+WtmOWIl+ihqOmHjOayoeaciSBmbiDlsLHov5Tlm54gZmFsc2VcbiAgaWYgKCFmbnMgfHwgZm5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyDpgY3ljoYgZXZlbnQg5YC85a+55bqU55qE57yT5a2Y5YiX6KGo77yM5L6d5qyh5omn6KGMIGZuXG4gIC8vIEB0cy1pZ25vcmVcbiAgZm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgZm4uYXBwbHkoX3RoaXMsIGFyZ3MpO1xuICB9KTtcbiAgcmV0dXJuIF90aGlzO1xufTtcblxuZnVuY3Rpb24gZm9vKGNvbnRlbnQ6IHN0cmluZykge1xuICBjb25zb2xlLmxvZyhgZm9vIDwtICR7Y29udGVudH1gKTtcbn1cblxuZnVuY3Rpb24gYmFyKGNvbnRlbnQ6IHN0cmluZykge1xuICBjb25zb2xlLmxvZyhgYmFyIDwtICR7Y29udGVudH1gKTtcbn1cblxuZnVuY3Rpb24gYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gIGNvbnNvbGUubG9nKGAke3h9ICsgJHt5fSA9ICR7eCArIHl9YCk7XG59XG5cbmZ1bmN0aW9uIHN1Yih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICBjb25zb2xlLmxvZyhgJHt4fSAtICR7eX0gPSAke3ggLSB5fWApO1xufVxuXG4vLyDorqLpmIVcbmVtaXR0ZXIub24oXCJhcnRpY2xlXCIsIGZvbyk7XG5lbWl0dGVyLm9uKFwiYXJ0aWNsZVwiLCBiYXIpO1xuZW1pdHRlci5vbihcIm1hdGhcIiwgYWRkKTtcbmVtaXR0ZXIub24oXCJtYXRoXCIsIHN1Yik7XG5cbi8vIOWPkeW4g1xuZW1pdHRlci5lbWl0KFwiYXJ0aWNsZVwiLCBcImhlbGxvIHdvcmxkXCIpO1xuZW1pdHRlci5lbWl0KFwibWF0aFwiLCAxLCAyKTtcbmVtaXR0ZXIuZW1pdChcIm1hdGhcIiwgMzAwLCAxMjApO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9