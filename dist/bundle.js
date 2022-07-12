/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/reactivity.ts":
/*!***************************!*\
  !*** ./src/reactivity.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computed = exports.effect = exports.ref = exports.reactive = void 0;
var targetMap = new WeakMap(); // targetMap stores the effects that each object should re-run when it's updated
var activeEffect = null; // The active effect running
function track(target, key) {
    if (activeEffect) {
        // <------ Check to see if we have an activeEffect
        // We need to make sure this effect is being tracked.
        var depsMap = targetMap.get(target); // Get the current depsMap for this target
        if (!depsMap) {
            // There is no map.
            targetMap.set(target, (depsMap = new Map())); // Create one
        }
        var dep = depsMap.get(key); // Get the current dependencies (effects) that need to be run when this is set
        if (!dep) {
            // There is no dependencies (effects)
            depsMap.set(key, (dep = new Set())); // Create a new Set
        }
        dep.add(activeEffect); // Add effect to dependency map
    }
}
function trigger(target, key) {
    var depsMap = targetMap.get(target); // Does this object have any properties that have dependencies (effects)
    if (!depsMap) {
        return;
    }
    var dep = depsMap.get(key); // If there are dependencies (effects) associated with this
    if (dep) {
        dep.forEach(function (effect) {
            // run them all
            effect();
        });
    }
}
function reactive(target) {
    var handlers = {
        get: function (target, key, receiver) {
            var result = Reflect.get(target, key, receiver);
            track(target, key); // If this reactive property (target) is GET inside then track the effect to rerun on SET
            return result;
        },
        set: function (target, key, value, receiver) {
            // https://bobbyhadz.com/blog/typescript-no-index-signature-with-parameter-of-type
            var oldValue = target[key];
            var result = Reflect.set(target, key, value, receiver);
            if (result && oldValue != value) {
                trigger(target, key); // If this reactive property (target) has effects to rerun on SET, trigger them.
            }
            return result;
        },
    };
    return new Proxy(target, handlers);
}
exports.reactive = reactive;
function ref(raw) {
    var r = {
        get value() {
            track(r, "value");
            return raw;
        },
        set value(newVal) {
            raw = newVal;
            trigger(r, "value");
        },
    };
    return r;
}
exports.ref = ref;
function effect(eff) {
    activeEffect = eff;
    activeEffect();
    activeEffect = null;
}
exports.effect = effect;
function computed(getter) {
    var result = ref();
    effect(function () { return (result.value = getter()); });
    return result;
}
exports.computed = computed;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var reactivity_1 = __webpack_require__(/*! ./reactivity */ "./src/reactivity.ts");
var product = (0, reactivity_1.reactive)({ price: 5, quantity: 2 });
var salePrice = (0, reactivity_1.computed)(function () {
    return product.price * 0.9;
});
var total = (0, reactivity_1.computed)(function () {
    return salePrice.value * product.quantity;
});
console.log("Before updated quantity total (should be 9) = ".concat(total.value, " salePrice (should be 4.5) = ").concat(salePrice.value));
product.quantity = 3;
console.log("After updated quantity total (should be 13.5) = ".concat(total.value, " salePrice (should be 4.5) = ").concat(salePrice.value));
product.price = 10;
console.log("After updated price total (should be 27) = ".concat(total.value, " salePrice (should be 9) = ").concat(salePrice.value));

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFRLENBQUM7QUFDNUMsQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsR0FBRyxDQUNULHdEQUFpRCxLQUFLLENBQUMsS0FBSywwQ0FBZ0MsU0FBUyxDQUFDLEtBQUssQ0FBRSxDQUM5RyxDQUFDO0FBQ0YsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FDVCwwREFBbUQsS0FBSyxDQUFDLEtBQUssMENBQWdDLFNBQVMsQ0FBQyxLQUFLLENBQUUsQ0FDaEgsQ0FBQztBQUNGLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQ1QscURBQThDLEtBQUssQ0FBQyxLQUFLLHdDQUE4QixTQUFTLENBQUMsS0FBSyxDQUFFLENBQ3pHLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlYWN0aXZpdHkudHMiLCJ3ZWJwYWNrOi8vbXZ2bS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGFyZ2V0TWFwID0gbmV3IFdlYWtNYXAoKTsgLy8gdGFyZ2V0TWFwIHN0b3JlcyB0aGUgZWZmZWN0cyB0aGF0IGVhY2ggb2JqZWN0IHNob3VsZCByZS1ydW4gd2hlbiBpdCdzIHVwZGF0ZWRcbmxldCBhY3RpdmVFZmZlY3Q6IEZ1bmN0aW9uID0gbnVsbDsgLy8gVGhlIGFjdGl2ZSBlZmZlY3QgcnVubmluZ1xuXG5mdW5jdGlvbiB0cmFjayh0YXJnZXQ6IG9iamVjdCwga2V5OiBQcm9wZXJ0eUtleSkge1xuICBpZiAoYWN0aXZlRWZmZWN0KSB7XG4gICAgLy8gPC0tLS0tLSBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhbiBhY3RpdmVFZmZlY3RcbiAgICAvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGlzIGVmZmVjdCBpcyBiZWluZyB0cmFja2VkLlxuICAgIGxldCBkZXBzTWFwID0gdGFyZ2V0TWFwLmdldCh0YXJnZXQpOyAvLyBHZXQgdGhlIGN1cnJlbnQgZGVwc01hcCBmb3IgdGhpcyB0YXJnZXRcbiAgICBpZiAoIWRlcHNNYXApIHtcbiAgICAgIC8vIFRoZXJlIGlzIG5vIG1hcC5cbiAgICAgIHRhcmdldE1hcC5zZXQodGFyZ2V0LCAoZGVwc01hcCA9IG5ldyBNYXAoKSkpOyAvLyBDcmVhdGUgb25lXG4gICAgfVxuICAgIGxldCBkZXAgPSBkZXBzTWFwLmdldChrZXkpOyAvLyBHZXQgdGhlIGN1cnJlbnQgZGVwZW5kZW5jaWVzIChlZmZlY3RzKSB0aGF0IG5lZWQgdG8gYmUgcnVuIHdoZW4gdGhpcyBpcyBzZXRcbiAgICBpZiAoIWRlcCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gZGVwZW5kZW5jaWVzIChlZmZlY3RzKVxuICAgICAgZGVwc01hcC5zZXQoa2V5LCAoZGVwID0gbmV3IFNldCgpKSk7IC8vIENyZWF0ZSBhIG5ldyBTZXRcbiAgICB9XG4gICAgZGVwLmFkZChhY3RpdmVFZmZlY3QpOyAvLyBBZGQgZWZmZWN0IHRvIGRlcGVuZGVuY3kgbWFwXG4gIH1cbn1cblxuZnVuY3Rpb24gdHJpZ2dlcih0YXJnZXQ6IG9iamVjdCwga2V5OiBQcm9wZXJ0eUtleSkge1xuICBjb25zdCBkZXBzTWFwID0gdGFyZ2V0TWFwLmdldCh0YXJnZXQpOyAvLyBEb2VzIHRoaXMgb2JqZWN0IGhhdmUgYW55IHByb3BlcnRpZXMgdGhhdCBoYXZlIGRlcGVuZGVuY2llcyAoZWZmZWN0cylcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBkZXAgPSBkZXBzTWFwLmdldChrZXkpOyAvLyBJZiB0aGVyZSBhcmUgZGVwZW5kZW5jaWVzIChlZmZlY3RzKSBhc3NvY2lhdGVkIHdpdGggdGhpc1xuICBpZiAoZGVwKSB7XG4gICAgZGVwLmZvckVhY2goKGVmZmVjdDogRnVuY3Rpb24pID0+IHtcbiAgICAgIC8vIHJ1biB0aGVtIGFsbFxuICAgICAgZWZmZWN0KCk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWN0aXZlKHRhcmdldDogb2JqZWN0KSB7XG4gIGNvbnN0IGhhbmRsZXJzID0ge1xuICAgIGdldCh0YXJnZXQ6IG9iamVjdCwga2V5OiBQcm9wZXJ0eUtleSwgcmVjZWl2ZXI6IGFueSkge1xuICAgICAgbGV0IHJlc3VsdCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICB0cmFjayh0YXJnZXQsIGtleSk7IC8vIElmIHRoaXMgcmVhY3RpdmUgcHJvcGVydHkgKHRhcmdldCkgaXMgR0VUIGluc2lkZSB0aGVuIHRyYWNrIHRoZSBlZmZlY3QgdG8gcmVydW4gb24gU0VUXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgc2V0KHRhcmdldDogb2JqZWN0LCBrZXk6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSB7XG4gICAgICAvLyBodHRwczovL2JvYmJ5aGFkei5jb20vYmxvZy90eXBlc2NyaXB0LW5vLWluZGV4LXNpZ25hdHVyZS13aXRoLXBhcmFtZXRlci1vZi10eXBlXG4gICAgICBsZXQgb2xkVmFsdWUgPSB0YXJnZXRba2V5IGFzIGtleW9mIHR5cGVvZiB0YXJnZXRdO1xuICAgICAgbGV0IHJlc3VsdCA9IFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgaWYgKHJlc3VsdCAmJiBvbGRWYWx1ZSAhPSB2YWx1ZSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwga2V5KTsgLy8gSWYgdGhpcyByZWFjdGl2ZSBwcm9wZXJ0eSAodGFyZ2V0KSBoYXMgZWZmZWN0cyB0byByZXJ1biBvbiBTRVQsIHRyaWdnZXIgdGhlbS5cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgfTtcbiAgcmV0dXJuIG5ldyBQcm94eSh0YXJnZXQsIGhhbmRsZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZihyYXc/OiBhbnkpIHtcbiAgY29uc3QgciA9IHtcbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICB0cmFjayhyLCBcInZhbHVlXCIpO1xuICAgICAgcmV0dXJuIHJhdztcbiAgICB9LFxuICAgIHNldCB2YWx1ZShuZXdWYWwpIHtcbiAgICAgIHJhdyA9IG5ld1ZhbDtcbiAgICAgIHRyaWdnZXIociwgXCJ2YWx1ZVwiKTtcbiAgICB9LFxuICB9O1xuICByZXR1cm4gcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVmZmVjdChlZmY6IEZ1bmN0aW9uKSB7XG4gIGFjdGl2ZUVmZmVjdCA9IGVmZjtcbiAgYWN0aXZlRWZmZWN0KCk7XG4gIGFjdGl2ZUVmZmVjdCA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlZChnZXR0ZXI6IEZ1bmN0aW9uKSB7XG4gIGxldCByZXN1bHQgPSByZWYoKTtcbiAgZWZmZWN0KCgpID0+IChyZXN1bHQudmFsdWUgPSBnZXR0ZXIoKSkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IGNvbXB1dGVkLCByZWFjdGl2ZSB9IGZyb20gXCIuL3JlYWN0aXZpdHlcIjtcblxubGV0IHByb2R1Y3Q6IGFueSA9IHJlYWN0aXZlKHsgcHJpY2U6IDUsIHF1YW50aXR5OiAyIH0pO1xuXG5sZXQgc2FsZVByaWNlID0gY29tcHV0ZWQoKCkgPT4ge1xuICByZXR1cm4gcHJvZHVjdC5wcmljZSAqIDAuOTtcbn0pO1xuXG5sZXQgdG90YWwgPSBjb21wdXRlZCgoKSA9PiB7XG4gIHJldHVybiBzYWxlUHJpY2UudmFsdWUgKiBwcm9kdWN0LnF1YW50aXR5O1xufSk7XG5cbmNvbnNvbGUubG9nKFxuICBgQmVmb3JlIHVwZGF0ZWQgcXVhbnRpdHkgdG90YWwgKHNob3VsZCBiZSA5KSA9ICR7dG90YWwudmFsdWV9IHNhbGVQcmljZSAoc2hvdWxkIGJlIDQuNSkgPSAke3NhbGVQcmljZS52YWx1ZX1gXG4pO1xucHJvZHVjdC5xdWFudGl0eSA9IDM7XG5jb25zb2xlLmxvZyhcbiAgYEFmdGVyIHVwZGF0ZWQgcXVhbnRpdHkgdG90YWwgKHNob3VsZCBiZSAxMy41KSA9ICR7dG90YWwudmFsdWV9IHNhbGVQcmljZSAoc2hvdWxkIGJlIDQuNSkgPSAke3NhbGVQcmljZS52YWx1ZX1gXG4pO1xucHJvZHVjdC5wcmljZSA9IDEwO1xuY29uc29sZS5sb2coXG4gIGBBZnRlciB1cGRhdGVkIHByaWNlIHRvdGFsIChzaG91bGQgYmUgMjcpID0gJHt0b3RhbC52YWx1ZX0gc2FsZVByaWNlIChzaG91bGQgYmUgOSkgPSAke3NhbGVQcmljZS52YWx1ZX1gXG4pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9