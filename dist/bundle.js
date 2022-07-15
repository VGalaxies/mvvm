/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/reactivity/effect.ts":
/*!**********************************!*\
  !*** ./src/reactivity/effect.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.effect = exports.trigger = exports.track = void 0;
var type_1 = __webpack_require__(/*! ./type */ "./src/reactivity/type.ts");
var activeEffect = null;
var effectStack = []; // for nested effects
var targetMap = new WeakMap();
function track(target, key) {
    if (!activeEffect) {
        return;
    }
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    var deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}
exports.track = track;
function trigger(target, key, type) {
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    var effects = depsMap.get(key);
    var effectsToRun = new Set();
    effects &&
        effects.forEach(function (effectFn) {
            // get-and-set
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
            }
        });
    if (type === type_1.TriggerType.ADD || type === type_1.TriggerType.DELETE) {
        // for ... in
        var iterateEffects = depsMap.get(type_1.ITERATE_KEY);
        iterateEffects &&
            iterateEffects.forEach(function (effectFn) {
                // get-and-set
                if (effectFn !== activeEffect) {
                    effectsToRun.add(effectFn);
                }
            });
    }
    effectsToRun.forEach(function (effectFn) {
        // intro scheduler
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn);
        }
        else {
            effectFn();
        }
    });
}
exports.trigger = trigger;
function cleanup(effectFn) {
    for (var i = 0; i < effectFn.deps.length; ++i) {
        var deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
    effectFn.deps.length = 0;
}
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    var effectFn = function () {
        cleanup(effectFn);
        activeEffect = effectFn;
        effectStack.push(effectFn);
        var res = fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        return res;
    };
    effectFn.options = options;
    effectFn.deps = [];
    if (!options.lazy) {
        effectFn();
    }
    return effectFn;
}
exports.effect = effect;


/***/ }),

/***/ "./src/reactivity/index.ts":
/*!*********************************!*\
  !*** ./src/reactivity/index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.shallowReadonly = exports.readonly = exports.shallowReactive = exports.reactive = void 0;
var effect_1 = __webpack_require__(/*! ./effect */ "./src/reactivity/effect.ts");
var type_1 = __webpack_require__(/*! ./type */ "./src/reactivity/type.ts");
function reactive(target) {
    return createReactive(target);
}
exports.reactive = reactive;
function shallowReactive(target) {
    return createReactive(target, true);
}
exports.shallowReactive = shallowReactive;
function readonly(target) {
    return createReactive(target, false, true);
}
exports.readonly = readonly;
function shallowReadonly(target) {
    return createReactive(target, true, true);
}
exports.shallowReadonly = shallowReadonly;
function createReactive(target, isShallow, isReadOnly) {
    if (isShallow === void 0) { isShallow = false; }
    if (isReadOnly === void 0) { isReadOnly = false; }
    var handlers = {
        get: function (target, key, receiver) {
            // reactive(obj).raw = obj
            if (key === "raw") {
                return target;
            }
            if (!isReadOnly) {
                (0, effect_1.track)(target, key);
            }
            var res = Reflect.get(target, key, receiver);
            if (isShallow) {
                // shallow reactive
                return res;
            }
            if (typeof res === "object" && res !== null) {
                return isReadOnly ? readonly(res) : reactive(res); // default -> deep reactive
            }
            return res;
        },
        set: function (target, key, newValue, receiver) {
            if (isReadOnly) {
                console.log("attr ".concat(String(key), " is read only"));
                return true;
            }
            var oldValue = target[key];
            var type = Object.prototype.hasOwnProperty.call(target, key)
                ? type_1.TriggerType.SET
                : type_1.TriggerType.ADD;
            var res = Reflect.set(target, key, newValue, receiver);
            if (target == receiver.raw && // prototype inheritance
                oldValue !== newValue &&
                (oldValue === oldValue || newValue === newValue) // NaN
            ) {
                (0, effect_1.trigger)(target, key, type);
            }
            return res;
        },
        has: function (target, key) {
            (0, effect_1.track)(target, key);
            return Reflect.has(target, key);
        },
        ownKeys: function (target) {
            (0, effect_1.track)(target, type_1.ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty: function (target, key) {
            if (isReadOnly) {
                console.log("attr ".concat(String(key), " is read only"));
                return true;
            }
            var hadKey = Object.prototype.hasOwnProperty.call(target, key);
            var res = Reflect.deleteProperty(target, key);
            if (res && hadKey) {
                (0, effect_1.trigger)(target, key, type_1.TriggerType.DELETE);
            }
            return res;
        },
    };
    return new Proxy(target, handlers);
}


/***/ }),

/***/ "./src/reactivity/type.ts":
/*!********************************!*\
  !*** ./src/reactivity/type.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TriggerType = exports.ITERATE_KEY = void 0;
exports.ITERATE_KEY = Symbol();
var TriggerType;
(function (TriggerType) {
    TriggerType["SET"] = "SET";
    TriggerType["ADD"] = "ADD";
    TriggerType["DELETE"] = "DELETE";
})(TriggerType = exports.TriggerType || (exports.TriggerType = {}));


/***/ }),

/***/ "./src/render/common.ts":
/*!******************************!*\
  !*** ./src/render/common.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.insert = exports.setElementText = exports.createElement = void 0;
function createElement(tag) {
    return document.createElement(tag);
}
exports.createElement = createElement;
function setElementText(el, text) {
    el.textContent = text;
}
exports.setElementText = setElementText;
function insert(el, parent, anchor) {
    parent.insertBefore(el, anchor);
}
exports.insert = insert;


/***/ }),

/***/ "./src/render/components.ts":
/*!**********************************!*\
  !*** ./src/render/components.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mountComponent = exports.patchComponent = void 0;
var effect_1 = __webpack_require__(/*! ../reactivity/effect */ "./src/reactivity/effect.ts");
var patch_1 = __webpack_require__(/*! ./patch */ "./src/render/patch.ts");
var reactivity_1 = __webpack_require__(/*! ../reactivity */ "./src/reactivity/index.ts");
function resolveProps(options, propsData) {
    var props = {};
    var attrs = {};
    for (var key in propsData) {
        if (key in options) {
            // defined in ComponentOptions.props
            props[key] = propsData[key];
        }
        else {
            // not defined in ComponentOptions.props
            attrs[key] = propsData[key];
        }
    }
    return [props, attrs];
}
function hasPropsChanged(prevProps, nextProps) {
    var nextKeys = Object.keys(nextProps);
    var prevKeys = Object.keys(prevProps);
    if (nextKeys.length !== prevKeys.length) {
        return true;
    }
    for (var i = 0; i < nextKeys.length; ++i) {
        var key = nextKeys[i];
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}
function patchComponent(n1, n2, anchor) {
    var instance = (n2.component = n1.component);
    var props = instance.props; // shallow reactive
    if (hasPropsChanged(n1.props, n2.props)) {
        var nextProps = resolveProps(n2.type.props, n2.props)[0];
        for (var key in nextProps) {
            props[key] = nextProps[key];
        }
        for (var key in props) {
            if (!(key in nextProps)) {
                delete props[key];
            }
        }
    }
}
exports.patchComponent = patchComponent;
function mountComponent(vnode, container, anchor) {
    var componentOptions = vnode.type;
    var render = componentOptions.render, data = componentOptions.data, propsOption = componentOptions.props, beforeCreate = componentOptions.beforeCreate, created = componentOptions.created, beforeMount = componentOptions.beforeMount, mounted = componentOptions.mounted, beforeUpdate = componentOptions.beforeUpdate, updated = componentOptions.updated;
    beforeCreate && beforeCreate();
    var instance = {
        state: {},
        props: {},
        isMounted: false,
        subTree: null,
    };
    var props = resolveProps(propsOption, vnode.props)[0];
    instance.props = (0, reactivity_1.shallowReactive)(props);
    instance.state = (0, reactivity_1.reactive)(data ? data() : {});
    vnode.component = instance;
    var renderContext = new Proxy(instance, {
        get: function (target, key, receiver) {
            var state = target.state, props = target.props;
            if (state && key in state) {
                return state[key];
            }
            else if (key in props) {
                return props[key];
            }
            else {
                console.log("".concat(String(key), " not existed"));
            }
        },
        set: function (target, key, value, receiver) {
            var state = target.state, props = target.props;
            if (state && key in state) {
                state[key] = value;
                return true;
            }
            else if (key in props) {
                console.warn("attempt to mutate prop ".concat(String(key), ", props are readonly"));
                return false;
            }
            else {
                console.log("".concat(String(key), " not existed"));
                return false;
            }
        },
    });
    created && created.call(renderContext);
    (0, effect_1.effect)(function () {
        var subTree = render.call(renderContext);
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(renderContext);
            (0, patch_1.patch)(null, subTree, container, anchor);
            instance.isMounted = true;
            mounted && mounted.call(renderContext);
        }
        else {
            beforeUpdate && beforeUpdate.call(renderContext);
            (0, patch_1.patch)(instance.subTree, subTree, container, anchor);
            updated && updated.call(renderContext);
        }
        instance.subTree = subTree;
    }
    // {
    //   scheduler: queueJob,
    // }
    );
}
exports.mountComponent = mountComponent;


/***/ }),

/***/ "./src/render/index.ts":
/*!*****************************!*\
  !*** ./src/render/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRenderer = void 0;
var patch_1 = __webpack_require__(/*! ./patch */ "./src/render/patch.ts");
var mount_1 = __webpack_require__(/*! ./mount */ "./src/render/mount.ts");
function createRenderer() {
    function render(vnode, container) {
        if (vnode) {
            (0, patch_1.patch)(container.vnode, vnode, container);
        }
        else {
            if (container.vnode) {
                (0, mount_1.unmount)(container.vnode);
            }
        }
        container.vnode = vnode;
    }
    return {
        render: render,
        patch: patch_1.patch,
    };
}
exports.createRenderer = createRenderer;


/***/ }),

/***/ "./src/render/mount.ts":
/*!*****************************!*\
  !*** ./src/render/mount.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unmount = exports.mountElement = void 0;
var common_1 = __webpack_require__(/*! ./common */ "./src/render/common.ts");
var patch_1 = __webpack_require__(/*! ./patch */ "./src/render/patch.ts");
function mountElement(vnode, container) {
    var el = (vnode.el = (0, common_1.createElement)(vnode.type));
    // props
    if (vnode.props) {
        for (var key in vnode.props) {
            (0, patch_1.patchProps)(el, key, null, vnode.props[key]);
        }
    }
    // children
    if (typeof vnode.children === "string") {
        (0, common_1.setElementText)(el, vnode.children);
    }
    else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(function (child) {
            (0, patch_1.patch)(null, child, el);
        });
    }
    (0, common_1.insert)(el, container);
}
exports.mountElement = mountElement;
function unmount(vnode) {
    var el = vnode.el;
    var parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
exports.unmount = unmount;


/***/ }),

/***/ "./src/render/patch.ts":
/*!*****************************!*\
  !*** ./src/render/patch.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patch = exports.patchProps = void 0;
var mount_1 = __webpack_require__(/*! ./mount */ "./src/render/mount.ts");
var components_1 = __webpack_require__(/*! ./components */ "./src/render/components.ts");
var common_1 = __webpack_require__(/*! ./common */ "./src/render/common.ts");
function patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
        var invokers = el.vei || (el.vei = {});
        var invoker_1 = invokers[key];
        var name_1 = key.slice(2).toLowerCase();
        if (nextValue) {
            if (!invoker_1) {
                invoker_1 = el.vei[key] = function (e) {
                    if (e.timeStamp < invoker_1.attached) {
                        return;
                    }
                    if (Array.isArray(invoker_1.value)) {
                        // multiple handlers
                        invoker_1.value.forEach(function (fn) { return fn(e); });
                    }
                    else {
                        invoker_1.value(e);
                    }
                };
                invoker_1.value = nextValue;
                invoker_1.attached = performance.now();
                el.addEventListener(name_1, invoker_1);
            }
            else {
                // for efficiency
                // avoid removeEventListener when updating
                invoker_1.value = nextValue;
            }
        }
        else if (invoker_1) {
            el.removeEventListener(name_1, invoker_1);
        }
    }
    else if (key === "class") {
        // for efficiency
        // since `"class" in el` is false, and `setAttribute` is slower
        el.className = nextValue || "";
    }
    else {
        if (key in el) {
            // set DOM properties first
            var type = typeof el[key];
            // handle button disabled
            if (type === "boolean" && nextValue === "") {
                el[key] = true;
            }
            else {
                el[key] = nextValue;
            }
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
exports.patchProps = patchProps;
function patchChildren(n1, n2, container) {
    if (typeof n2.children === "string") {
        if (Array.isArray(n1.children)) {
            n1.children.forEach(function (c) { return (0, mount_1.unmount)(c); });
        }
        (0, common_1.setElementText)(container, n2.children);
    }
    else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            // TODO -> fast diff
            n1.children.forEach(function (c) { return (0, mount_1.unmount)(c); });
            n2.children.forEach(function (c) { return patch(null, c, container); });
        }
        else {
            (0, common_1.setElementText)(container, "");
            n2.children.forEach(function (c) { return patch(null, c, container); });
        }
    }
    else {
        if (Array.isArray(n1.children)) {
            n1.children.forEach(function (c) { return (0, mount_1.unmount)(c); });
        }
        else if (typeof n1.children === "string") {
            (0, common_1.setElementText)(container, "");
        }
    }
}
function patchElement(n1, n2) {
    var el = (n2.el = n1.el);
    // props
    var oldProps = n1.props;
    var newProps = n2.props;
    for (var key in newProps) {
        if (newProps[key] !== oldProps[key]) {
            patchProps(el, key, oldProps[key], newProps[key]);
        }
    }
    for (var key in oldProps) {
        if (!(key in newProps)) {
            patchProps(el, key, oldProps[key], null);
        }
    }
    // children
    patchChildren(n1, n2, el);
}
function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        (0, mount_1.unmount)(n1);
        n1 = null;
    }
    var type = n2.type;
    if (typeof type === "string") {
        // tag
        if (!n1) {
            (0, mount_1.mountElement)(n2, container);
        }
        else {
            patchElement(n1, n2);
        }
    }
    else if (typeof type === "object") {
        // component
        if (!n1) {
            (0, components_1.mountComponent)(n2, container, anchor);
        }
        else {
            (0, components_1.patchComponent)(n1, n2, anchor);
        }
    }
}
exports.patch = patch;


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
var render_1 = __webpack_require__(/*! ./render */ "./src/render/index.ts");
var renderer = (0, render_1.createRenderer)();
var container = document.getElementById("app");
// const bol = ref(false);
// effect(() => {
//   const vnode = {
//     type: "div",
//     props: bol.value
//       ? {
//           onClick: () => {
//             console.log("clicked");
//           },
//         }
//       : {},
//     children: [
//       {
//         type: "p",
//         props: {
//           onClick: () => {
//             bol.value = true;
//           },
//         },
//         children: "hello",
//       },
//     ],
//   };
//   renderer.render(vnode, container);
// });
var component = {
    name: "demo",
    props: {
        onClick: function () { },
    },
    data: function () {
        return {
            count: 1,
        };
    },
    render: function () {
        return {
            type: "div",
            props: {
                onClick: function () {
                    this.count++;
                    console.log("count is ".concat(this.count));
                },
            },
            children: "count is ".concat(this.count),
        };
    },
};
var vnode = {
    type: component,
    props: {
        onClick: function () {
            this.count++;
            console.log("count is ".concat(this.count));
        },
    },
};
renderer.render(vnode, container);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNMLE9BQU87WUFDTCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFZLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7S0FDRjtDQUNGLENBQUM7QUFFRixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL212dm0vLi9zcmMvcmVhY3Rpdml0eS9lZmZlY3QudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZWFjdGl2aXR5L2luZGV4LnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVhY3Rpdml0eS90eXBlLnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVuZGVyL2NvbW1vbi50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlbmRlci9jb21wb25lbnRzLnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVuZGVyL2luZGV4LnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVuZGVyL21vdW50LnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVuZGVyL3BhdGNoLnRzIiwid2VicGFjazovL212dm0vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFueVN1cHBsaWVyLCBQcm9wZXJ0eU1hcCB9IGZyb20gXCIuLi90eXBlL2dsb2JhbFwiO1xuaW1wb3J0IHsgSVRFUkFURV9LRVksIFRyaWdnZXJUeXBlIH0gZnJvbSBcIi4vdHlwZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdEZuIGV4dGVuZHMgQW55U3VwcGxpZXIge1xuICBkZXBzOiBBcnJheTxTZXQ8RWZmZWN0Rm4+PjsgLy8gZm9yIGNsZWFuIHVwXG4gIG9wdGlvbnM/OiBFZmZlY3RPcHRpb25zO1xufVxuXG50eXBlIEVmZmVjdEZuQ29uc3VtZXIgPSAoYXJnPzogRWZmZWN0Rm4pID0+IHZvaWQ7XG5cbmludGVyZmFjZSBFZmZlY3RPcHRpb25zIHtcbiAgc2NoZWR1bGVyPzogRWZmZWN0Rm5Db25zdW1lcjtcbiAgbGF6eT86IGJvb2xlYW47XG59XG5cbmxldCBhY3RpdmVFZmZlY3Q6IEVmZmVjdEZuID0gbnVsbDtcbmNvbnN0IGVmZmVjdFN0YWNrOiBBcnJheTxFZmZlY3RGbj4gPSBbXTsgLy8gZm9yIG5lc3RlZCBlZmZlY3RzXG5cbmNvbnN0IHRhcmdldE1hcCA9IG5ldyBXZWFrTWFwPFByb3BlcnR5TWFwLCBNYXA8UHJvcGVydHlLZXksIFNldDxFZmZlY3RGbj4+PigpO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2sodGFyZ2V0OiBQcm9wZXJ0eU1hcCwga2V5OiBQcm9wZXJ0eUtleSkge1xuICBpZiAoIWFjdGl2ZUVmZmVjdCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgZGVwc01hcCA9IHRhcmdldE1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgdGFyZ2V0TWFwLnNldCh0YXJnZXQsIChkZXBzTWFwID0gbmV3IE1hcDxQcm9wZXJ0eUtleSwgU2V0PEVmZmVjdEZuPj4oKSkpO1xuICB9XG4gIGxldCBkZXBzID0gZGVwc01hcC5nZXQoa2V5KTtcbiAgaWYgKCFkZXBzKSB7XG4gICAgZGVwc01hcC5zZXQoa2V5LCAoZGVwcyA9IG5ldyBTZXQ8RWZmZWN0Rm4+KCkpKTtcbiAgfVxuICBkZXBzLmFkZChhY3RpdmVFZmZlY3QpO1xuICBhY3RpdmVFZmZlY3QuZGVwcy5wdXNoKGRlcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlcihcbiAgdGFyZ2V0OiBQcm9wZXJ0eU1hcCxcbiAga2V5OiBQcm9wZXJ0eUtleSxcbiAgdHlwZT86IFRyaWdnZXJUeXBlXG4pIHtcbiAgY29uc3QgZGVwc01hcCA9IHRhcmdldE1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZWZmZWN0cyA9IGRlcHNNYXAuZ2V0KGtleSk7XG5cbiAgY29uc3QgZWZmZWN0c1RvUnVuID0gbmV3IFNldDxFZmZlY3RGbj4oKTtcbiAgZWZmZWN0cyAmJlxuICAgIGVmZmVjdHMuZm9yRWFjaCgoZWZmZWN0Rm4pID0+IHtcbiAgICAgIC8vIGdldC1hbmQtc2V0XG4gICAgICBpZiAoZWZmZWN0Rm4gIT09IGFjdGl2ZUVmZmVjdCkge1xuICAgICAgICBlZmZlY3RzVG9SdW4uYWRkKGVmZmVjdEZuKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICBpZiAodHlwZSA9PT0gVHJpZ2dlclR5cGUuQUREIHx8IHR5cGUgPT09IFRyaWdnZXJUeXBlLkRFTEVURSkge1xuICAgIC8vIGZvciAuLi4gaW5cbiAgICBjb25zdCBpdGVyYXRlRWZmZWN0cyA9IGRlcHNNYXAuZ2V0KElURVJBVEVfS0VZKTtcbiAgICBpdGVyYXRlRWZmZWN0cyAmJlxuICAgICAgaXRlcmF0ZUVmZmVjdHMuZm9yRWFjaCgoZWZmZWN0Rm4pID0+IHtcbiAgICAgICAgLy8gZ2V0LWFuZC1zZXRcbiAgICAgICAgaWYgKGVmZmVjdEZuICE9PSBhY3RpdmVFZmZlY3QpIHtcbiAgICAgICAgICBlZmZlY3RzVG9SdW4uYWRkKGVmZmVjdEZuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBlZmZlY3RzVG9SdW4uZm9yRWFjaCgoZWZmZWN0Rm4pID0+IHtcbiAgICAvLyBpbnRybyBzY2hlZHVsZXJcbiAgICBpZiAoZWZmZWN0Rm4ub3B0aW9ucy5zY2hlZHVsZXIpIHtcbiAgICAgIGVmZmVjdEZuLm9wdGlvbnMuc2NoZWR1bGVyKGVmZmVjdEZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWZmZWN0Rm4oKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjbGVhbnVwKGVmZmVjdEZuOiBFZmZlY3RGbikge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVmZmVjdEZuLmRlcHMubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBkZXBzID0gZWZmZWN0Rm4uZGVwc1tpXTtcbiAgICBkZXBzLmRlbGV0ZShlZmZlY3RGbik7XG4gIH1cbiAgZWZmZWN0Rm4uZGVwcy5sZW5ndGggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZWZmZWN0KGZuOiBBbnlTdXBwbGllciwgb3B0aW9uczogRWZmZWN0T3B0aW9ucyA9IHt9KTogRWZmZWN0Rm4ge1xuICBjb25zdCBlZmZlY3RGbjogRWZmZWN0Rm4gPSAoKSA9PiB7XG4gICAgY2xlYW51cChlZmZlY3RGbik7XG4gICAgYWN0aXZlRWZmZWN0ID0gZWZmZWN0Rm47XG4gICAgZWZmZWN0U3RhY2sucHVzaChlZmZlY3RGbik7XG4gICAgY29uc3QgcmVzID0gZm4oKTtcbiAgICBlZmZlY3RTdGFjay5wb3AoKTtcbiAgICBhY3RpdmVFZmZlY3QgPSBlZmZlY3RTdGFja1tlZmZlY3RTdGFjay5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gcmVzO1xuICB9O1xuICBlZmZlY3RGbi5vcHRpb25zID0gb3B0aW9ucztcbiAgZWZmZWN0Rm4uZGVwcyA9IFtdO1xuICBpZiAoIW9wdGlvbnMubGF6eSkge1xuICAgIGVmZmVjdEZuKCk7XG4gIH1cbiAgcmV0dXJuIGVmZmVjdEZuO1xufVxuIiwiaW1wb3J0IHsgUHJvcGVydHlNYXAgfSBmcm9tIFwiLi4vdHlwZS9nbG9iYWxcIjtcbmltcG9ydCB7IHRyYWNrLCB0cmlnZ2VyIH0gZnJvbSBcIi4vZWZmZWN0XCI7XG5pbXBvcnQgeyBJVEVSQVRFX0tFWSwgVHJpZ2dlclR5cGUgfSBmcm9tIFwiLi90eXBlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFjdGl2ZSh0YXJnZXQ6IFByb3BlcnR5TWFwKTogUHJvcGVydHlNYXAge1xuICByZXR1cm4gY3JlYXRlUmVhY3RpdmUodGFyZ2V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dSZWFjdGl2ZSh0YXJnZXQ6IFByb3BlcnR5TWFwKTogUHJvcGVydHlNYXAge1xuICByZXR1cm4gY3JlYXRlUmVhY3RpdmUodGFyZ2V0LCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRvbmx5KHRhcmdldDogUHJvcGVydHlNYXApOiBQcm9wZXJ0eU1hcCB7XG4gIHJldHVybiBjcmVhdGVSZWFjdGl2ZSh0YXJnZXQsIGZhbHNlLCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dSZWFkb25seSh0YXJnZXQ6IFByb3BlcnR5TWFwKTogUHJvcGVydHlNYXAge1xuICByZXR1cm4gY3JlYXRlUmVhY3RpdmUodGFyZ2V0LCB0cnVlLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVhY3RpdmUoXG4gIHRhcmdldDogUHJvcGVydHlNYXAsXG4gIGlzU2hhbGxvdzogYm9vbGVhbiA9IGZhbHNlLFxuICBpc1JlYWRPbmx5OiBib29sZWFuID0gZmFsc2Vcbik6IFByb3BlcnR5TWFwIHtcbiAgY29uc3QgaGFuZGxlcnMgPSB7XG4gICAgZ2V0KHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXksIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgLy8gcmVhY3RpdmUob2JqKS5yYXcgPSBvYmpcbiAgICAgIGlmIChrZXkgPT09IFwicmF3XCIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cbiAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICB0cmFjayh0YXJnZXQsIGtleSk7XG4gICAgICB9XG4gICAgICBjb25zdCByZXMgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgICAgaWYgKGlzU2hhbGxvdykge1xuICAgICAgICAvLyBzaGFsbG93IHJlYWN0aXZlXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlcyA9PT0gXCJvYmplY3RcIiAmJiByZXMgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGlzUmVhZE9ubHkgPyByZWFkb25seShyZXMpIDogcmVhY3RpdmUocmVzKTsgLy8gZGVmYXVsdCAtPiBkZWVwIHJlYWN0aXZlXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgc2V0KFxuICAgICAgdGFyZ2V0OiBQcm9wZXJ0eU1hcCxcbiAgICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgICBuZXdWYWx1ZTogYW55LFxuICAgICAgcmVjZWl2ZXI6IGFueVxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgaWYgKGlzUmVhZE9ubHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYGF0dHIgJHtTdHJpbmcoa2V5KX0gaXMgcmVhZCBvbmx5YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgICAgIGNvbnN0IHR5cGUgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpXG4gICAgICAgID8gVHJpZ2dlclR5cGUuU0VUXG4gICAgICAgIDogVHJpZ2dlclR5cGUuQUREO1xuICAgICAgY29uc3QgcmVzID0gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIG5ld1ZhbHVlLCByZWNlaXZlcik7XG4gICAgICBpZiAoXG4gICAgICAgIHRhcmdldCA9PSByZWNlaXZlci5yYXcgJiYgLy8gcHJvdG90eXBlIGluaGVyaXRhbmNlXG4gICAgICAgIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSAmJlxuICAgICAgICAob2xkVmFsdWUgPT09IG9sZFZhbHVlIHx8IG5ld1ZhbHVlID09PSBuZXdWYWx1ZSkgLy8gTmFOXG4gICAgICApIHtcbiAgICAgICAgdHJpZ2dlcih0YXJnZXQsIGtleSwgdHlwZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXkpOiBib29sZWFuIHtcbiAgICAgIHRyYWNrKHRhcmdldCwga2V5KTtcbiAgICAgIHJldHVybiBSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSk7XG4gICAgfSxcbiAgICBvd25LZXlzKHRhcmdldDogUHJvcGVydHlNYXApOiAoc3RyaW5nIHwgc3ltYm9sKVtdIHtcbiAgICAgIHRyYWNrKHRhcmdldCwgSVRFUkFURV9LRVkpO1xuICAgICAgcmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpO1xuICAgIH0sXG4gICAgZGVsZXRlUHJvcGVydHkodGFyZ2V0OiBQcm9wZXJ0eU1hcCwga2V5OiBQcm9wZXJ0eUtleSk6IGJvb2xlYW4ge1xuICAgICAgaWYgKGlzUmVhZE9ubHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYGF0dHIgJHtTdHJpbmcoa2V5KX0gaXMgcmVhZCBvbmx5YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgaGFkS2V5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KTtcbiAgICAgIGNvbnN0IHJlcyA9IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpO1xuICAgICAgaWYgKHJlcyAmJiBoYWRLZXkpIHtcbiAgICAgICAgdHJpZ2dlcih0YXJnZXQsIGtleSwgVHJpZ2dlclR5cGUuREVMRVRFKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcbiAgfTtcbiAgcmV0dXJuIG5ldyBQcm94eSh0YXJnZXQsIGhhbmRsZXJzKTtcbn1cbiIsImV4cG9ydCBjb25zdCBJVEVSQVRFX0tFWSA9IFN5bWJvbCgpO1xuXG5leHBvcnQgZW51bSBUcmlnZ2VyVHlwZSB7XG4gIFNFVCA9IFwiU0VUXCIsXG4gIEFERCA9IFwiQUREXCIsXG4gIERFTEVURSA9IFwiREVMRVRFXCIsXG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWc6IHN0cmluZykge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RWxlbWVudFRleHQoZWw6IEhUTUxFbGVtZW50LCB0ZXh0OiBzdHJpbmcpIHtcbiAgZWwudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0KGVsOiBIVE1MRWxlbWVudCwgcGFyZW50OiBIVE1MRWxlbWVudCwgYW5jaG9yPzogTm9kZSkge1xuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCBhbmNob3IpO1xufVxuIiwiaW1wb3J0IHsgSFRNTEVsZW1lbnRXaXRoVk5vZGUsIEhUTUxWaXJ0dWFsTm9kZSB9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IFByb3BlcnR5TWFwLCBWb2lkU3VwcGxpZXIgfSBmcm9tIFwiLi4vdHlwZS9nbG9iYWxcIjtcbmltcG9ydCB7IGVmZmVjdCB9IGZyb20gXCIuLi9yZWFjdGl2aXR5L2VmZmVjdFwiO1xuaW1wb3J0IHsgcGF0Y2ggfSBmcm9tIFwiLi9wYXRjaFwiO1xuaW1wb3J0IHsgcmVhY3RpdmUsIHNoYWxsb3dSZWFjdGl2ZSB9IGZyb20gXCIuLi9yZWFjdGl2aXR5XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50T3B0aW9ucyB7XG4gIG5hbWU6IHN0cmluZztcbiAgcmVuZGVyOiAoKSA9PiBIVE1MVmlydHVhbE5vZGU7XG4gIGRhdGE/OiAoKSA9PiBQcm9wZXJ0eU1hcDtcbiAgcHJvcHM/OiBQcm9wZXJ0eU1hcDtcblxuICAvLyBob29rc1xuICBiZWZvcmVDcmVhdGU/OiBWb2lkU3VwcGxpZXI7XG4gIGNyZWF0ZWQ/OiBWb2lkU3VwcGxpZXI7XG4gIGJlZm9yZU1vdW50PzogVm9pZFN1cHBsaWVyO1xuICBtb3VudGVkPzogVm9pZFN1cHBsaWVyO1xuICBiZWZvcmVVcGRhdGU/OiBWb2lkU3VwcGxpZXI7XG4gIHVwZGF0ZWQ/OiBWb2lkU3VwcGxpZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50SW5zdGFuY2Uge1xuICBzdGF0ZTogUHJvcGVydHlNYXA7IC8vIGRlZXAgcmVhY3RpdmVcbiAgcHJvcHM6IFByb3BlcnR5TWFwOyAvLyBzaGFsbG93IHJlYWN0aXZlXG4gIGlzTW91bnRlZDogYm9vbGVhbjtcbiAgc3ViVHJlZTogSFRNTFZpcnR1YWxOb2RlO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUHJvcHMob3B0aW9uczogUHJvcGVydHlNYXAsIHByb3BzRGF0YTogUHJvcGVydHlNYXApIHtcbiAgY29uc3QgcHJvcHM6IFByb3BlcnR5TWFwID0ge307XG4gIGNvbnN0IGF0dHJzOiBQcm9wZXJ0eU1hcCA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wc0RhdGEpIHtcbiAgICBpZiAoa2V5IGluIG9wdGlvbnMpIHtcbiAgICAgIC8vIGRlZmluZWQgaW4gQ29tcG9uZW50T3B0aW9ucy5wcm9wc1xuICAgICAgcHJvcHNba2V5XSA9IHByb3BzRGF0YVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3QgZGVmaW5lZCBpbiBDb21wb25lbnRPcHRpb25zLnByb3BzXG4gICAgICBhdHRyc1trZXldID0gcHJvcHNEYXRhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBbcHJvcHMsIGF0dHJzXTtcbn1cblxuZnVuY3Rpb24gaGFzUHJvcHNDaGFuZ2VkKFxuICBwcmV2UHJvcHM6IFByb3BlcnR5TWFwLFxuICBuZXh0UHJvcHM6IFByb3BlcnR5TWFwXG4pOiBib29sZWFuIHtcbiAgY29uc3QgbmV4dEtleXMgPSBPYmplY3Qua2V5cyhuZXh0UHJvcHMpO1xuICBjb25zdCBwcmV2S2V5cyA9IE9iamVjdC5rZXlzKHByZXZQcm9wcyk7XG4gIGlmIChuZXh0S2V5cy5sZW5ndGggIT09IHByZXZLZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEtleXMubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBrZXkgPSBuZXh0S2V5c1tpXTtcbiAgICBpZiAobmV4dFByb3BzW2tleV0gIT09IHByZXZQcm9wc1trZXldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hDb21wb25lbnQoXG4gIG4xOiBIVE1MVmlydHVhbE5vZGUsXG4gIG4yOiBIVE1MVmlydHVhbE5vZGUsXG4gIGFuY2hvcj86IE5vZGVcbikge1xuICBjb25zdCBpbnN0YW5jZSA9IChuMi5jb21wb25lbnQgPSBuMS5jb21wb25lbnQpO1xuICBjb25zdCB7IHByb3BzIH0gPSBpbnN0YW5jZTsgLy8gc2hhbGxvdyByZWFjdGl2ZVxuICBpZiAoaGFzUHJvcHNDaGFuZ2VkKG4xLnByb3BzLCBuMi5wcm9wcykpIHtcbiAgICBjb25zdCBbbmV4dFByb3BzXSA9IHJlc29sdmVQcm9wcyhcbiAgICAgIChuMi50eXBlIGFzIENvbXBvbmVudE9wdGlvbnMpLnByb3BzLFxuICAgICAgbjIucHJvcHNcbiAgICApO1xuICAgIGZvciAoY29uc3Qga2V5IGluIG5leHRQcm9wcykge1xuICAgICAgcHJvcHNba2V5XSA9IG5leHRQcm9wc1trZXldO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wcykge1xuICAgICAgaWYgKCEoa2V5IGluIG5leHRQcm9wcykpIHtcbiAgICAgICAgZGVsZXRlIHByb3BzW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudENvbXBvbmVudChcbiAgdm5vZGU6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudFdpdGhWTm9kZSxcbiAgYW5jaG9yPzogTm9kZVxuKSB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSB2bm9kZS50eXBlIGFzIENvbXBvbmVudE9wdGlvbnM7XG4gIGNvbnN0IHtcbiAgICByZW5kZXIsXG4gICAgZGF0YSxcbiAgICBwcm9wczogcHJvcHNPcHRpb24sXG4gICAgYmVmb3JlQ3JlYXRlLFxuICAgIGNyZWF0ZWQsXG4gICAgYmVmb3JlTW91bnQsXG4gICAgbW91bnRlZCxcbiAgICBiZWZvcmVVcGRhdGUsXG4gICAgdXBkYXRlZCxcbiAgfSA9IGNvbXBvbmVudE9wdGlvbnM7XG5cbiAgYmVmb3JlQ3JlYXRlICYmIGJlZm9yZUNyZWF0ZSgpO1xuXG4gIGNvbnN0IGluc3RhbmNlOiBDb21wb25lbnRJbnN0YW5jZSA9IHtcbiAgICBzdGF0ZToge30sXG4gICAgcHJvcHM6IHt9LFxuICAgIGlzTW91bnRlZDogZmFsc2UsXG4gICAgc3ViVHJlZTogbnVsbCxcbiAgfTtcbiAgY29uc3QgW3Byb3BzXSA9IHJlc29sdmVQcm9wcyhwcm9wc09wdGlvbiwgdm5vZGUucHJvcHMpO1xuICBpbnN0YW5jZS5wcm9wcyA9IHNoYWxsb3dSZWFjdGl2ZShwcm9wcyk7XG4gIGluc3RhbmNlLnN0YXRlID0gcmVhY3RpdmUoZGF0YSA/IGRhdGEoKSA6IHt9KTtcblxuICB2bm9kZS5jb21wb25lbnQgPSBpbnN0YW5jZTtcblxuICBjb25zdCByZW5kZXJDb250ZXh0ID0gbmV3IFByb3h5KGluc3RhbmNlLCB7XG4gICAgZ2V0KHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXksIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgY29uc3QgeyBzdGF0ZSwgcHJvcHMgfSA9IHRhcmdldDtcbiAgICAgIGlmIChzdGF0ZSAmJiBrZXkgaW4gc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlW2tleV07XG4gICAgICB9IGVsc2UgaWYgKGtleSBpbiBwcm9wcykge1xuICAgICAgICByZXR1cm4gcHJvcHNba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke1N0cmluZyhrZXkpfSBub3QgZXhpc3RlZGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KFxuICAgICAgdGFyZ2V0OiBQcm9wZXJ0eU1hcCxcbiAgICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgICB2YWx1ZTogYW55LFxuICAgICAgcmVjZWl2ZXI6IGFueVxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgeyBzdGF0ZSwgcHJvcHMgfSA9IHRhcmdldDtcbiAgICAgIGlmIChzdGF0ZSAmJiBrZXkgaW4gc3RhdGUpIHtcbiAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5IGluIHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgYXR0ZW1wdCB0byBtdXRhdGUgcHJvcCAke1N0cmluZyhrZXkpfSwgcHJvcHMgYXJlIHJlYWRvbmx5YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtTdHJpbmcoa2V5KX0gbm90IGV4aXN0ZWRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIGNyZWF0ZWQgJiYgY3JlYXRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuXG4gIGVmZmVjdChcbiAgICAoKSA9PiB7XG4gICAgICBjb25zdCBzdWJUcmVlID0gcmVuZGVyLmNhbGwocmVuZGVyQ29udGV4dCk7XG4gICAgICBpZiAoIWluc3RhbmNlLmlzTW91bnRlZCkge1xuICAgICAgICBiZWZvcmVNb3VudCAmJiBiZWZvcmVNb3VudC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgICBwYXRjaChudWxsLCBzdWJUcmVlLCBjb250YWluZXIsIGFuY2hvcik7XG4gICAgICAgIGluc3RhbmNlLmlzTW91bnRlZCA9IHRydWU7XG4gICAgICAgIG1vdW50ZWQgJiYgbW91bnRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVmb3JlVXBkYXRlICYmIGJlZm9yZVVwZGF0ZS5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgICBwYXRjaChpbnN0YW5jZS5zdWJUcmVlLCBzdWJUcmVlLCBjb250YWluZXIsIGFuY2hvcik7XG4gICAgICAgIHVwZGF0ZWQgJiYgdXBkYXRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgfVxuICAgICAgaW5zdGFuY2Uuc3ViVHJlZSA9IHN1YlRyZWU7XG4gICAgfVxuICAgIC8vIHtcbiAgICAvLyAgIHNjaGVkdWxlcjogcXVldWVKb2IsXG4gICAgLy8gfVxuICApO1xufVxuIiwiaW1wb3J0IHsgSFRNTEVsZW1lbnRXaXRoVk5vZGUsIEhUTUxWaXJ0dWFsTm9kZSB9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IHBhdGNoIH0gZnJvbSBcIi4vcGF0Y2hcIjtcbmltcG9ydCB7IHVubW91bnQgfSBmcm9tIFwiLi9tb3VudFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIGZ1bmN0aW9uIHJlbmRlcih2bm9kZTogSFRNTFZpcnR1YWxOb2RlLCBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aFZOb2RlKSB7XG4gICAgaWYgKHZub2RlKSB7XG4gICAgICBwYXRjaChjb250YWluZXIudm5vZGUsIHZub2RlLCBjb250YWluZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY29udGFpbmVyLnZub2RlKSB7XG4gICAgICAgIHVubW91bnQoY29udGFpbmVyLnZub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGFpbmVyLnZub2RlID0gdm5vZGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlbmRlcixcbiAgICBwYXRjaCxcbiAgfTtcbn1cbiIsImltcG9ydCB7IEhUTUxFbGVtZW50V2l0aFZOb2RlLCBIVE1MVmlydHVhbE5vZGUgfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBpbnNlcnQsIHNldEVsZW1lbnRUZXh0IH0gZnJvbSBcIi4vY29tbW9uXCI7XG5pbXBvcnQgeyBwYXRjaCwgcGF0Y2hQcm9wcyB9IGZyb20gXCIuL3BhdGNoXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudEVsZW1lbnQoXG4gIHZub2RlOiBIVE1MVmlydHVhbE5vZGUsXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnRXaXRoVk5vZGVcbikge1xuICBjb25zdCBlbCA9ICh2bm9kZS5lbCA9IGNyZWF0ZUVsZW1lbnQodm5vZGUudHlwZSBhcyBzdHJpbmcpKTtcblxuICAvLyBwcm9wc1xuICBpZiAodm5vZGUucHJvcHMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB2bm9kZS5wcm9wcykge1xuICAgICAgcGF0Y2hQcm9wcyhlbCwga2V5LCBudWxsLCB2bm9kZS5wcm9wc1trZXldKTtcbiAgICB9XG4gIH1cblxuICAvLyBjaGlsZHJlblxuICBpZiAodHlwZW9mIHZub2RlLmNoaWxkcmVuID09PSBcInN0cmluZ1wiKSB7XG4gICAgc2V0RWxlbWVudFRleHQoZWwsIHZub2RlLmNoaWxkcmVuKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSkge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBwYXRjaChudWxsLCBjaGlsZCwgZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgaW5zZXJ0KGVsLCBjb250YWluZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5tb3VudCh2bm9kZTogSFRNTFZpcnR1YWxOb2RlKSB7XG4gIGNvbnN0IGVsID0gdm5vZGUuZWw7XG4gIGNvbnN0IHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpO1xuICB9XG59XG4iLCJpbXBvcnQge1xuICBIVE1MRWxlbWVudERldGFpbCxcbiAgSFRNTEVsZW1lbnRXaXRoVk5vZGUsXG4gIEhUTUxWaXJ0dWFsTm9kZSxcbn0gZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgbW91bnRFbGVtZW50LCB1bm1vdW50IH0gZnJvbSBcIi4vbW91bnRcIjtcbmltcG9ydCB7IG1vdW50Q29tcG9uZW50LCBwYXRjaENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IHNldEVsZW1lbnRUZXh0IH0gZnJvbSBcIi4vY29tbW9uXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaFByb3BzKFxuICBlbDogSFRNTEVsZW1lbnREZXRhaWwsXG4gIGtleTogc3RyaW5nLFxuICBwcmV2VmFsdWU6IGFueSxcbiAgbmV4dFZhbHVlOiBhbnlcbikge1xuICBpZiAoL15vbi8udGVzdChrZXkpKSB7XG4gICAgY29uc3QgaW52b2tlcnMgPSBlbC52ZWkgfHwgKGVsLnZlaSA9IHt9KTtcbiAgICBsZXQgaW52b2tlciA9IGludm9rZXJzW2tleV07XG4gICAgY29uc3QgbmFtZSA9IGtleS5zbGljZSgyKS50b0xvd2VyQ2FzZSgpIGFzIGtleW9mIEhUTUxFbGVtZW50RXZlbnRNYXA7XG4gICAgaWYgKG5leHRWYWx1ZSkge1xuICAgICAgaWYgKCFpbnZva2VyKSB7XG4gICAgICAgIGludm9rZXIgPSBlbC52ZWlba2V5XSA9IChlKSA9PiB7XG4gICAgICAgICAgaWYgKGUudGltZVN0YW1wIDwgaW52b2tlci5hdHRhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnZva2VyLnZhbHVlKSkge1xuICAgICAgICAgICAgLy8gbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgICAgICAgIGludm9rZXIudmFsdWUuZm9yRWFjaCgoZm4pID0+IGZuKGUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW52b2tlci52YWx1ZShlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGludm9rZXIudmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgICAgIGludm9rZXIuYXR0YWNoZWQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBpbnZva2VyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZvciBlZmZpY2llbmN5XG4gICAgICAgIC8vIGF2b2lkIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2hlbiB1cGRhdGluZ1xuICAgICAgICBpbnZva2VyLnZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW52b2tlcikge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBpbnZva2VyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAvLyBmb3IgZWZmaWNpZW5jeVxuICAgIC8vIHNpbmNlIGBcImNsYXNzXCIgaW4gZWxgIGlzIGZhbHNlLCBhbmQgYHNldEF0dHJpYnV0ZWAgaXMgc2xvd2VyXG4gICAgZWwuY2xhc3NOYW1lID0gbmV4dFZhbHVlIHx8IFwiXCI7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGtleSBpbiBlbCkge1xuICAgICAgLy8gc2V0IERPTSBwcm9wZXJ0aWVzIGZpcnN0XG4gICAgICBjb25zdCB0eXBlID0gdHlwZW9mIGVsW2tleV07XG4gICAgICAvLyBoYW5kbGUgYnV0dG9uIGRpc2FibGVkXG4gICAgICBpZiAodHlwZSA9PT0gXCJib29sZWFuXCIgJiYgbmV4dFZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgIGVsW2tleV0gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxba2V5XSA9IG5leHRWYWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgbmV4dFZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihcbiAgbjE6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgbjI6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudERldGFpbFxuKSB7XG4gIGlmICh0eXBlb2YgbjIuY2hpbGRyZW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShuMS5jaGlsZHJlbikpIHtcbiAgICAgIG4xLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHVubW91bnQoYykpO1xuICAgIH1cbiAgICBzZXRFbGVtZW50VGV4dChjb250YWluZXIsIG4yLmNoaWxkcmVuKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG4yLmNoaWxkcmVuKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG4xLmNoaWxkcmVuKSkge1xuICAgICAgLy8gVE9ETyAtPiBmYXN0IGRpZmZcbiAgICAgIG4xLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHVubW91bnQoYykpO1xuICAgICAgbjIuY2hpbGRyZW4uZm9yRWFjaCgoYykgPT4gcGF0Y2gobnVsbCwgYywgY29udGFpbmVyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldEVsZW1lbnRUZXh0KGNvbnRhaW5lciwgXCJcIik7XG4gICAgICBuMi5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiBwYXRjaChudWxsLCBjLCBjb250YWluZXIpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobjEuY2hpbGRyZW4pKSB7XG4gICAgICBuMS5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiB1bm1vdW50KGMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuMS5jaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc2V0RWxlbWVudFRleHQoY29udGFpbmVyLCBcIlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hFbGVtZW50KG4xOiBIVE1MVmlydHVhbE5vZGUsIG4yOiBIVE1MVmlydHVhbE5vZGUpIHtcbiAgY29uc3QgZWwgPSAobjIuZWwgPSBuMS5lbCk7XG5cbiAgLy8gcHJvcHNcbiAgY29uc3Qgb2xkUHJvcHMgPSBuMS5wcm9wcztcbiAgY29uc3QgbmV3UHJvcHMgPSBuMi5wcm9wcztcbiAgZm9yIChjb25zdCBrZXkgaW4gbmV3UHJvcHMpIHtcbiAgICBpZiAobmV3UHJvcHNba2V5XSAhPT0gb2xkUHJvcHNba2V5XSkge1xuICAgICAgcGF0Y2hQcm9wcyhlbCwga2V5LCBvbGRQcm9wc1trZXldLCBuZXdQcm9wc1trZXldKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIShrZXkgaW4gbmV3UHJvcHMpKSB7XG4gICAgICBwYXRjaFByb3BzKGVsLCBrZXksIG9sZFByb3BzW2tleV0sIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNoaWxkcmVuXG4gIHBhdGNoQ2hpbGRyZW4objEsIG4yLCBlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaChcbiAgbjE6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgbjI6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudFdpdGhWTm9kZSxcbiAgYW5jaG9yPzogTm9kZVxuKSB7XG4gIGlmIChuMSAmJiBuMS50eXBlICE9PSBuMi50eXBlKSB7XG4gICAgdW5tb3VudChuMSk7XG4gICAgbjEgPSBudWxsO1xuICB9XG4gIGNvbnN0IHsgdHlwZSB9ID0gbjI7XG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIC8vIHRhZ1xuICAgIGlmICghbjEpIHtcbiAgICAgIG1vdW50RWxlbWVudChuMiwgY29udGFpbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2hFbGVtZW50KG4xLCBuMik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY29tcG9uZW50XG4gICAgaWYgKCFuMSkge1xuICAgICAgbW91bnRDb21wb25lbnQobjIsIGNvbnRhaW5lciwgYW5jaG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2hDb21wb25lbnQobjEsIG4yLCBhbmNob3IpO1xuICAgIH1cbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IGNyZWF0ZVJlbmRlcmVyIH0gZnJvbSBcIi4vcmVuZGVyXCI7XG5pbXBvcnQgeyBlZmZlY3QgfSBmcm9tIFwiLi9yZWFjdGl2aXR5L2VmZmVjdFwiO1xuaW1wb3J0IHsgcmVmIH0gZnJvbSBcIi4vcmVhY3Rpdml0eS9yZWZcIjtcbmltcG9ydCB7IENvbXBvbmVudE9wdGlvbnMgfSBmcm9tIFwiLi9yZW5kZXIvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgSFRNTFZpcnR1YWxOb2RlIH0gZnJvbSBcIi4vcmVuZGVyL3R5cGVcIjtcblxuY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG5cbi8vIGNvbnN0IGJvbCA9IHJlZihmYWxzZSk7XG4vLyBlZmZlY3QoKCkgPT4ge1xuLy8gICBjb25zdCB2bm9kZSA9IHtcbi8vICAgICB0eXBlOiBcImRpdlwiLFxuLy8gICAgIHByb3BzOiBib2wudmFsdWVcbi8vICAgICAgID8ge1xuLy8gICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiKTtcbi8vICAgICAgICAgICB9LFxuLy8gICAgICAgICB9XG4vLyAgICAgICA6IHt9LFxuLy8gICAgIGNoaWxkcmVuOiBbXG4vLyAgICAgICB7XG4vLyAgICAgICAgIHR5cGU6IFwicFwiLFxuLy8gICAgICAgICBwcm9wczoge1xuLy8gICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbi8vICAgICAgICAgICAgIGJvbC52YWx1ZSA9IHRydWU7XG4vLyAgICAgICAgICAgfSxcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgY2hpbGRyZW46IFwiaGVsbG9cIixcbi8vICAgICAgIH0sXG4vLyAgICAgXSxcbi8vICAgfTtcbi8vICAgcmVuZGVyZXIucmVuZGVyKHZub2RlLCBjb250YWluZXIpO1xuLy8gfSk7XG5cbmNvbnN0IGNvbXBvbmVudDogQ29tcG9uZW50T3B0aW9ucyA9IHtcbiAgbmFtZTogXCJkZW1vXCIsXG4gIHByb3BzOiB7XG4gICAgb25DbGljaygpIHt9LFxuICB9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb3VudDogMSxcbiAgICB9O1xuICB9LFxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiZGl2XCIsXG4gICAgICBwcm9wczoge1xuICAgICAgICBvbkNsaWNrKCkge1xuICAgICAgICAgIHRoaXMuY291bnQrKztcbiAgICAgICAgICBjb25zb2xlLmxvZyhgY291bnQgaXMgJHt0aGlzLmNvdW50fWApO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGNoaWxkcmVuOiBgY291bnQgaXMgJHt0aGlzLmNvdW50fWAsXG4gICAgfTtcbiAgfSxcbn07XG5cbmNvbnN0IHZub2RlOiBIVE1MVmlydHVhbE5vZGUgPSB7XG4gIHR5cGU6IGNvbXBvbmVudCxcbiAgcHJvcHM6IHtcbiAgICBvbkNsaWNrKCkge1xuICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgY29uc29sZS5sb2coYGNvdW50IGlzICR7dGhpcy5jb3VudH1gKTtcbiAgICB9LFxuICB9LFxufTtcblxucmVuZGVyZXIucmVuZGVyKHZub2RlLCBjb250YWluZXIpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9