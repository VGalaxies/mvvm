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
        if ((options && key in options) || key.startsWith("on")) {
            // defined in `ComponentOptions.props` or event handler
            props[key] = propsData[key];
        }
        else {
            // not defined in `ComponentOptions.props`
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
    // fetch options
    var componentOptions = vnode.type;
    var render = componentOptions.render;
    var data = componentOptions.data, propsOption = componentOptions.props, setup = componentOptions.setup, beforeCreate = componentOptions.beforeCreate, created = componentOptions.created, beforeMount = componentOptions.beforeMount, mounted = componentOptions.mounted, beforeUpdate = componentOptions.beforeUpdate, updated = componentOptions.updated;
    // before create
    beforeCreate && beforeCreate();
    // create instance
    var instance = {
        state: {},
        props: {},
        isMounted: false,
        subTree: null,
    };
    instance.state = (0, reactivity_1.reactive)(data ? data() : {});
    var _a = resolveProps(propsOption, vnode.props), props = _a[0], attrs = _a[1];
    instance.props = (0, reactivity_1.shallowReactive)(props);
    // setup
    function emit(event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // click -> onClick
        var eventName = "on".concat(event[0].toUpperCase() + event.slice(1));
        var handler = instance.props[eventName];
        if (handler) {
            handler.apply(void 0, args);
        }
        else {
            console.log("".concat(String(event), " not existed"));
        }
    }
    var setupContext = {
        attrs: attrs,
        emit: emit,
    };
    var setupState = null;
    if (setup) {
        var setupResult = setup((0, reactivity_1.shallowReadonly)(instance.props), setupContext);
        if (typeof setupResult === "function") {
            if (render) {
                console.error("setup return render function, ignore render options");
            }
            render = setupResult;
        }
        else {
            setupState = setupResult;
        }
    }
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
            else if (setupState && key in setupState) {
                return setupState[key];
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
            else if (setupState && key in setupState) {
                setupState[key] = value;
            }
            else {
                console.log("".concat(String(key), " not existed"));
                return false;
            }
        },
    });
    // after create
    created && created.call(renderContext);
    // reactive
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
/*!**************************!*\
  !*** ./example/input.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var render_1 = __webpack_require__(/*! ../src/render */ "./src/render/index.ts");
var app = document.getElementById("app");
var renderer = (0, render_1.createRenderer)();
var input = {
    name: "demo",
    data: function () {
        return {
            text: "",
        };
    },
    render: function () {
        var _this = this;
        return {
            type: "div",
            children: [
                {
                    type: "input",
                    props: {
                        onChange: function (e) {
                            _this.text = e.target.value;
                        },
                    },
                },
                {
                    type: "p",
                    children: "".concat(this.text),
                },
            ],
        };
    },
};
renderer.render({ type: input }, app);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Yy9yZWFjdGl2aXR5L2VmZmVjdC50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlYWN0aXZpdHkvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZWFjdGl2aXR5L3R5cGUudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZW5kZXIvY29tbW9uLnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVuZGVyL2NvbXBvbmVudHMudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZW5kZXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZW5kZXIvbW91bnQudHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZW5kZXIvcGF0Y2gudHMiLCJ3ZWJwYWNrOi8vbXZ2bS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tdnZtLy4vZXhhbXBsZS9pbnB1dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbnlTdXBwbGllciwgUHJvcGVydHlNYXAgfSBmcm9tIFwiLi4vdHlwZS9nbG9iYWxcIjtcbmltcG9ydCB7IElURVJBVEVfS0VZLCBUcmlnZ2VyVHlwZSB9IGZyb20gXCIuL3R5cGVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBFZmZlY3RGbiBleHRlbmRzIEFueVN1cHBsaWVyIHtcbiAgZGVwczogQXJyYXk8U2V0PEVmZmVjdEZuPj47IC8vIGZvciBjbGVhbiB1cFxuICBvcHRpb25zPzogRWZmZWN0T3B0aW9ucztcbn1cblxudHlwZSBFZmZlY3RGbkNvbnN1bWVyID0gKGFyZz86IEVmZmVjdEZuKSA9PiB2b2lkO1xuXG5pbnRlcmZhY2UgRWZmZWN0T3B0aW9ucyB7XG4gIHNjaGVkdWxlcj86IEVmZmVjdEZuQ29uc3VtZXI7XG4gIGxhenk/OiBib29sZWFuO1xufVxuXG5sZXQgYWN0aXZlRWZmZWN0OiBFZmZlY3RGbiA9IG51bGw7XG5jb25zdCBlZmZlY3RTdGFjazogQXJyYXk8RWZmZWN0Rm4+ID0gW107IC8vIGZvciBuZXN0ZWQgZWZmZWN0c1xuXG5jb25zdCB0YXJnZXRNYXAgPSBuZXcgV2Vha01hcDxQcm9wZXJ0eU1hcCwgTWFwPFByb3BlcnR5S2V5LCBTZXQ8RWZmZWN0Rm4+Pj4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXkpIHtcbiAgaWYgKCFhY3RpdmVFZmZlY3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGRlcHNNYXAgPSB0YXJnZXRNYXAuZ2V0KHRhcmdldCk7XG4gIGlmICghZGVwc01hcCkge1xuICAgIHRhcmdldE1hcC5zZXQodGFyZ2V0LCAoZGVwc01hcCA9IG5ldyBNYXA8UHJvcGVydHlLZXksIFNldDxFZmZlY3RGbj4+KCkpKTtcbiAgfVxuICBsZXQgZGVwcyA9IGRlcHNNYXAuZ2V0KGtleSk7XG4gIGlmICghZGVwcykge1xuICAgIGRlcHNNYXAuc2V0KGtleSwgKGRlcHMgPSBuZXcgU2V0PEVmZmVjdEZuPigpKSk7XG4gIH1cbiAgZGVwcy5hZGQoYWN0aXZlRWZmZWN0KTtcbiAgYWN0aXZlRWZmZWN0LmRlcHMucHVzaChkZXBzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXIoXG4gIHRhcmdldDogUHJvcGVydHlNYXAsXG4gIGtleTogUHJvcGVydHlLZXksXG4gIHR5cGU/OiBUcmlnZ2VyVHlwZVxuKSB7XG4gIGNvbnN0IGRlcHNNYXAgPSB0YXJnZXRNYXAuZ2V0KHRhcmdldCk7XG4gIGlmICghZGVwc01hcCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGVmZmVjdHMgPSBkZXBzTWFwLmdldChrZXkpO1xuXG4gIGNvbnN0IGVmZmVjdHNUb1J1biA9IG5ldyBTZXQ8RWZmZWN0Rm4+KCk7XG4gIGVmZmVjdHMgJiZcbiAgICBlZmZlY3RzLmZvckVhY2goKGVmZmVjdEZuKSA9PiB7XG4gICAgICAvLyBnZXQtYW5kLXNldFxuICAgICAgaWYgKGVmZmVjdEZuICE9PSBhY3RpdmVFZmZlY3QpIHtcbiAgICAgICAgZWZmZWN0c1RvUnVuLmFkZChlZmZlY3RGbik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgaWYgKHR5cGUgPT09IFRyaWdnZXJUeXBlLkFERCB8fCB0eXBlID09PSBUcmlnZ2VyVHlwZS5ERUxFVEUpIHtcbiAgICAvLyBmb3IgLi4uIGluXG4gICAgY29uc3QgaXRlcmF0ZUVmZmVjdHMgPSBkZXBzTWFwLmdldChJVEVSQVRFX0tFWSk7XG4gICAgaXRlcmF0ZUVmZmVjdHMgJiZcbiAgICAgIGl0ZXJhdGVFZmZlY3RzLmZvckVhY2goKGVmZmVjdEZuKSA9PiB7XG4gICAgICAgIC8vIGdldC1hbmQtc2V0XG4gICAgICAgIGlmIChlZmZlY3RGbiAhPT0gYWN0aXZlRWZmZWN0KSB7XG4gICAgICAgICAgZWZmZWN0c1RvUnVuLmFkZChlZmZlY3RGbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZWZmZWN0c1RvUnVuLmZvckVhY2goKGVmZmVjdEZuKSA9PiB7XG4gICAgLy8gaW50cm8gc2NoZWR1bGVyXG4gICAgaWYgKGVmZmVjdEZuLm9wdGlvbnMuc2NoZWR1bGVyKSB7XG4gICAgICBlZmZlY3RGbi5vcHRpb25zLnNjaGVkdWxlcihlZmZlY3RGbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVmZmVjdEZuKCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2xlYW51cChlZmZlY3RGbjogRWZmZWN0Rm4pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlZmZlY3RGbi5kZXBzLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgZGVwcyA9IGVmZmVjdEZuLmRlcHNbaV07XG4gICAgZGVwcy5kZWxldGUoZWZmZWN0Rm4pO1xuICB9XG4gIGVmZmVjdEZuLmRlcHMubGVuZ3RoID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVmZmVjdChmbjogQW55U3VwcGxpZXIsIG9wdGlvbnM6IEVmZmVjdE9wdGlvbnMgPSB7fSk6IEVmZmVjdEZuIHtcbiAgY29uc3QgZWZmZWN0Rm46IEVmZmVjdEZuID0gKCkgPT4ge1xuICAgIGNsZWFudXAoZWZmZWN0Rm4pO1xuICAgIGFjdGl2ZUVmZmVjdCA9IGVmZmVjdEZuO1xuICAgIGVmZmVjdFN0YWNrLnB1c2goZWZmZWN0Rm4pO1xuICAgIGNvbnN0IHJlcyA9IGZuKCk7XG4gICAgZWZmZWN0U3RhY2sucG9wKCk7XG4gICAgYWN0aXZlRWZmZWN0ID0gZWZmZWN0U3RhY2tbZWZmZWN0U3RhY2subGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgZWZmZWN0Rm4ub3B0aW9ucyA9IG9wdGlvbnM7XG4gIGVmZmVjdEZuLmRlcHMgPSBbXTtcbiAgaWYgKCFvcHRpb25zLmxhenkpIHtcbiAgICBlZmZlY3RGbigpO1xuICB9XG4gIHJldHVybiBlZmZlY3RGbjtcbn1cbiIsImltcG9ydCB7IFByb3BlcnR5TWFwIH0gZnJvbSBcIi4uL3R5cGUvZ2xvYmFsXCI7XG5pbXBvcnQgeyB0cmFjaywgdHJpZ2dlciB9IGZyb20gXCIuL2VmZmVjdFwiO1xuaW1wb3J0IHsgSVRFUkFURV9LRVksIFRyaWdnZXJUeXBlIH0gZnJvbSBcIi4vdHlwZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhY3RpdmUodGFyZ2V0OiBQcm9wZXJ0eU1hcCk6IFByb3BlcnR5TWFwIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlKHRhcmdldCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93UmVhY3RpdmUodGFyZ2V0OiBQcm9wZXJ0eU1hcCk6IFByb3BlcnR5TWFwIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlKHRhcmdldCwgdHJ1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkb25seSh0YXJnZXQ6IFByb3BlcnR5TWFwKTogUHJvcGVydHlNYXAge1xuICByZXR1cm4gY3JlYXRlUmVhY3RpdmUodGFyZ2V0LCBmYWxzZSwgdHJ1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93UmVhZG9ubHkodGFyZ2V0OiBQcm9wZXJ0eU1hcCk6IFByb3BlcnR5TWFwIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlKHRhcmdldCwgdHJ1ZSwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlYWN0aXZlKFxuICB0YXJnZXQ6IFByb3BlcnR5TWFwLFxuICBpc1NoYWxsb3c6IGJvb2xlYW4gPSBmYWxzZSxcbiAgaXNSZWFkT25seTogYm9vbGVhbiA9IGZhbHNlXG4pOiBQcm9wZXJ0eU1hcCB7XG4gIGNvbnN0IGhhbmRsZXJzID0ge1xuICAgIGdldCh0YXJnZXQ6IFByb3BlcnR5TWFwLCBrZXk6IFByb3BlcnR5S2V5LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgIC8vIHJlYWN0aXZlKG9iaikucmF3ID0gb2JqXG4gICAgICBpZiAoa2V5ID09PSBcInJhd1wiKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9XG4gICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgdHJhY2sodGFyZ2V0LCBrZXkpO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgIGlmIChpc1NoYWxsb3cpIHtcbiAgICAgICAgLy8gc2hhbGxvdyByZWFjdGl2ZVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByZXMgPT09IFwib2JqZWN0XCIgJiYgcmVzICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBpc1JlYWRPbmx5ID8gcmVhZG9ubHkocmVzKSA6IHJlYWN0aXZlKHJlcyk7IC8vIGRlZmF1bHQgLT4gZGVlcCByZWFjdGl2ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIHNldChcbiAgICAgIHRhcmdldDogUHJvcGVydHlNYXAsXG4gICAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgICAgbmV3VmFsdWU6IGFueSxcbiAgICAgIHJlY2VpdmVyOiBhbnlcbiAgICApOiBib29sZWFuIHtcbiAgICAgIGlmIChpc1JlYWRPbmx5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBhdHRyICR7U3RyaW5nKGtleSl9IGlzIHJlYWQgb25seWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgICBjb25zdCB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KVxuICAgICAgICA/IFRyaWdnZXJUeXBlLlNFVFxuICAgICAgICA6IFRyaWdnZXJUeXBlLkFERDtcbiAgICAgIGNvbnN0IHJlcyA9IFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCBuZXdWYWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgaWYgKFxuICAgICAgICB0YXJnZXQgPT0gcmVjZWl2ZXIucmF3ICYmIC8vIHByb3RvdHlwZSBpbmhlcml0YW5jZVxuICAgICAgICBvbGRWYWx1ZSAhPT0gbmV3VmFsdWUgJiZcbiAgICAgICAgKG9sZFZhbHVlID09PSBvbGRWYWx1ZSB8fCBuZXdWYWx1ZSA9PT0gbmV3VmFsdWUpIC8vIE5hTlxuICAgICAgKSB7XG4gICAgICAgIHRyaWdnZXIodGFyZ2V0LCBrZXksIHR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQ6IFByb3BlcnR5TWFwLCBrZXk6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gICAgICB0cmFjayh0YXJnZXQsIGtleSk7XG4gICAgICByZXR1cm4gUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpO1xuICAgIH0sXG4gICAgb3duS2V5cyh0YXJnZXQ6IFByb3BlcnR5TWFwKTogKHN0cmluZyB8IHN5bWJvbClbXSB7XG4gICAgICB0cmFjayh0YXJnZXQsIElURVJBVEVfS0VZKTtcbiAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0KTtcbiAgICB9LFxuICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXkpOiBib29sZWFuIHtcbiAgICAgIGlmIChpc1JlYWRPbmx5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBhdHRyICR7U3RyaW5nKGtleSl9IGlzIHJlYWQgb25seWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhhZEtleSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSk7XG4gICAgICBjb25zdCByZXMgPSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KTtcbiAgICAgIGlmIChyZXMgJiYgaGFkS2V5KSB7XG4gICAgICAgIHRyaWdnZXIodGFyZ2V0LCBrZXksIFRyaWdnZXJUeXBlLkRFTEVURSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gIH07XG4gIHJldHVybiBuZXcgUHJveHkodGFyZ2V0LCBoYW5kbGVycyk7XG59XG4iLCJleHBvcnQgY29uc3QgSVRFUkFURV9LRVkgPSBTeW1ib2woKTtcblxuZXhwb3J0IGVudW0gVHJpZ2dlclR5cGUge1xuICBTRVQgPSBcIlNFVFwiLFxuICBBREQgPSBcIkFERFwiLFxuICBERUxFVEUgPSBcIkRFTEVURVwiLFxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEVsZW1lbnRUZXh0KGVsOiBIVE1MRWxlbWVudCwgdGV4dDogc3RyaW5nKSB7XG4gIGVsLnRleHRDb250ZW50ID0gdGV4dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc2VydChlbDogSFRNTEVsZW1lbnQsIHBhcmVudDogSFRNTEVsZW1lbnQsIGFuY2hvcj86IE5vZGUpIHtcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgYW5jaG9yKTtcbn1cbiIsImltcG9ydCB7IEhUTUxFbGVtZW50V2l0aFZOb2RlLCBIVE1MVmlydHVhbE5vZGUgfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eU1hcCwgU3VwcGxpZXIsIFZvaWRTdXBwbGllciB9IGZyb20gXCIuLi90eXBlL2dsb2JhbFwiO1xuaW1wb3J0IHsgZWZmZWN0IH0gZnJvbSBcIi4uL3JlYWN0aXZpdHkvZWZmZWN0XCI7XG5pbXBvcnQgeyBwYXRjaCB9IGZyb20gXCIuL3BhdGNoXCI7XG5pbXBvcnQgeyByZWFjdGl2ZSwgc2hhbGxvd1JlYWN0aXZlLCBzaGFsbG93UmVhZG9ubHkgfSBmcm9tIFwiLi4vcmVhY3Rpdml0eVwiO1xuXG50eXBlIFZpcnR1YWxOb2RlU3VwcGxpZXIgPSBTdXBwbGllcjxIVE1MVmlydHVhbE5vZGU+O1xudHlwZSBQcm9wZXJ0eU1hcFN1cHBsaWVyID0gU3VwcGxpZXI8UHJvcGVydHlNYXA+O1xuXG50eXBlIEV2ZW50RW1pdHRlciA9IChldmVudDogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHZvaWQ7XG5cbmludGVyZmFjZSBTZXR1cENvbnRleHQge1xuICBhdHRycz86IFByb3BlcnR5TWFwO1xuICBlbWl0PzogRXZlbnRFbWl0dGVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudE9wdGlvbnMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHJlbmRlcj86IFZpcnR1YWxOb2RlU3VwcGxpZXI7XG4gIGRhdGE/OiBQcm9wZXJ0eU1hcFN1cHBsaWVyO1xuICBwcm9wcz86IFByb3BlcnR5TWFwO1xuICBzZXR1cD86IChcbiAgICBwcm9wczogUHJvcGVydHlNYXAsXG4gICAgY29udGV4dDogU2V0dXBDb250ZXh0XG4gICkgPT4gVmlydHVhbE5vZGVTdXBwbGllciB8IFByb3BlcnR5TWFwO1xuXG4gIC8vIGhvb2tzXG4gIGJlZm9yZUNyZWF0ZT86IFZvaWRTdXBwbGllcjtcbiAgY3JlYXRlZD86IFZvaWRTdXBwbGllcjtcbiAgYmVmb3JlTW91bnQ/OiBWb2lkU3VwcGxpZXI7XG4gIG1vdW50ZWQ/OiBWb2lkU3VwcGxpZXI7XG4gIGJlZm9yZVVwZGF0ZT86IFZvaWRTdXBwbGllcjtcbiAgdXBkYXRlZD86IFZvaWRTdXBwbGllcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRJbnN0YW5jZSB7XG4gIHN0YXRlOiBQcm9wZXJ0eU1hcDsgLy8gZGVlcCByZWFjdGl2ZVxuICBwcm9wczogUHJvcGVydHlNYXA7IC8vIHNoYWxsb3cgcmVhY3RpdmVcbiAgaXNNb3VudGVkOiBib29sZWFuO1xuICBzdWJUcmVlOiBIVE1MVmlydHVhbE5vZGU7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQcm9wcyhvcHRpb25zOiBQcm9wZXJ0eU1hcCwgcHJvcHNEYXRhOiBQcm9wZXJ0eU1hcCkge1xuICBjb25zdCBwcm9wczogUHJvcGVydHlNYXAgPSB7fTtcbiAgY29uc3QgYXR0cnM6IFByb3BlcnR5TWFwID0ge307XG4gIGZvciAoY29uc3Qga2V5IGluIHByb3BzRGF0YSkge1xuICAgIGlmICgob3B0aW9ucyAmJiBrZXkgaW4gb3B0aW9ucykgfHwga2V5LnN0YXJ0c1dpdGgoXCJvblwiKSkge1xuICAgICAgLy8gZGVmaW5lZCBpbiBgQ29tcG9uZW50T3B0aW9ucy5wcm9wc2Agb3IgZXZlbnQgaGFuZGxlclxuICAgICAgcHJvcHNba2V5XSA9IHByb3BzRGF0YVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3QgZGVmaW5lZCBpbiBgQ29tcG9uZW50T3B0aW9ucy5wcm9wc2BcbiAgICAgIGF0dHJzW2tleV0gPSBwcm9wc0RhdGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFtwcm9wcywgYXR0cnNdO1xufVxuXG5mdW5jdGlvbiBoYXNQcm9wc0NoYW5nZWQoXG4gIHByZXZQcm9wczogUHJvcGVydHlNYXAsXG4gIG5leHRQcm9wczogUHJvcGVydHlNYXBcbik6IGJvb2xlYW4ge1xuICBjb25zdCBuZXh0S2V5cyA9IE9iamVjdC5rZXlzKG5leHRQcm9wcyk7XG4gIGNvbnN0IHByZXZLZXlzID0gT2JqZWN0LmtleXMocHJldlByb3BzKTtcbiAgaWYgKG5leHRLZXlzLmxlbmd0aCAhPT0gcHJldktleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0S2V5cy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGtleSA9IG5leHRLZXlzW2ldO1xuICAgIGlmIChuZXh0UHJvcHNba2V5XSAhPT0gcHJldlByb3BzW2tleV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaENvbXBvbmVudChcbiAgbjE6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgbjI6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgYW5jaG9yPzogTm9kZVxuKSB7XG4gIGNvbnN0IGluc3RhbmNlID0gKG4yLmNvbXBvbmVudCA9IG4xLmNvbXBvbmVudCk7XG4gIGNvbnN0IHsgcHJvcHMgfSA9IGluc3RhbmNlOyAvLyBzaGFsbG93IHJlYWN0aXZlXG4gIGlmIChoYXNQcm9wc0NoYW5nZWQobjEucHJvcHMsIG4yLnByb3BzKSkge1xuICAgIGNvbnN0IFtuZXh0UHJvcHNdID0gcmVzb2x2ZVByb3BzKFxuICAgICAgKG4yLnR5cGUgYXMgQ29tcG9uZW50T3B0aW9ucykucHJvcHMsXG4gICAgICBuMi5wcm9wc1xuICAgICk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gbmV4dFByb3BzKSB7XG4gICAgICBwcm9wc1trZXldID0gbmV4dFByb3BzW2tleV07XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHByb3BzKSB7XG4gICAgICBpZiAoIShrZXkgaW4gbmV4dFByb3BzKSkge1xuICAgICAgICBkZWxldGUgcHJvcHNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdW50Q29tcG9uZW50KFxuICB2bm9kZTogSFRNTFZpcnR1YWxOb2RlLFxuICBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aFZOb2RlLFxuICBhbmNob3I/OiBOb2RlXG4pIHtcbiAgLy8gZmV0Y2ggb3B0aW9uc1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gdm5vZGUudHlwZSBhcyBDb21wb25lbnRPcHRpb25zO1xuICBsZXQgeyByZW5kZXIgfSA9IGNvbXBvbmVudE9wdGlvbnM7XG4gIGNvbnN0IHtcbiAgICBkYXRhLFxuICAgIHByb3BzOiBwcm9wc09wdGlvbixcbiAgICBzZXR1cCxcblxuICAgIGJlZm9yZUNyZWF0ZSxcbiAgICBjcmVhdGVkLFxuICAgIGJlZm9yZU1vdW50LFxuICAgIG1vdW50ZWQsXG4gICAgYmVmb3JlVXBkYXRlLFxuICAgIHVwZGF0ZWQsXG4gIH0gPSBjb21wb25lbnRPcHRpb25zO1xuXG4gIC8vIGJlZm9yZSBjcmVhdGVcbiAgYmVmb3JlQ3JlYXRlICYmIGJlZm9yZUNyZWF0ZSgpO1xuXG4gIC8vIGNyZWF0ZSBpbnN0YW5jZVxuICBjb25zdCBpbnN0YW5jZTogQ29tcG9uZW50SW5zdGFuY2UgPSB7XG4gICAgc3RhdGU6IHt9LFxuICAgIHByb3BzOiB7fSxcbiAgICBpc01vdW50ZWQ6IGZhbHNlLFxuICAgIHN1YlRyZWU6IG51bGwsXG4gIH07XG5cbiAgaW5zdGFuY2Uuc3RhdGUgPSByZWFjdGl2ZShkYXRhID8gZGF0YSgpIDoge30pO1xuXG4gIGNvbnN0IFtwcm9wcywgYXR0cnNdID0gcmVzb2x2ZVByb3BzKHByb3BzT3B0aW9uLCB2bm9kZS5wcm9wcyk7XG4gIGluc3RhbmNlLnByb3BzID0gc2hhbGxvd1JlYWN0aXZlKHByb3BzKTtcblxuICAvLyBzZXR1cFxuICBmdW5jdGlvbiBlbWl0KGV2ZW50OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkge1xuICAgIC8vIGNsaWNrIC0+IG9uQ2xpY2tcbiAgICBjb25zdCBldmVudE5hbWUgPSBgb24ke2V2ZW50WzBdLnRvVXBwZXJDYXNlKCkgKyBldmVudC5zbGljZSgxKX1gO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBpbnN0YW5jZS5wcm9wc1tldmVudE5hbWVdO1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhgJHtTdHJpbmcoZXZlbnQpfSBub3QgZXhpc3RlZGApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNldHVwQ29udGV4dDogU2V0dXBDb250ZXh0ID0ge1xuICAgIGF0dHJzLFxuICAgIGVtaXQsXG4gIH07XG4gIGxldCBzZXR1cFN0YXRlOiBQcm9wZXJ0eU1hcCA9IG51bGw7XG4gIGlmIChzZXR1cCkge1xuICAgIGNvbnN0IHNldHVwUmVzdWx0ID0gc2V0dXAoc2hhbGxvd1JlYWRvbmx5KGluc3RhbmNlLnByb3BzKSwgc2V0dXBDb250ZXh0KTtcbiAgICBpZiAodHlwZW9mIHNldHVwUmVzdWx0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmIChyZW5kZXIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcInNldHVwIHJldHVybiByZW5kZXIgZnVuY3Rpb24sIGlnbm9yZSByZW5kZXIgb3B0aW9uc1wiKTtcbiAgICAgIH1cbiAgICAgIHJlbmRlciA9IHNldHVwUmVzdWx0IGFzIFZpcnR1YWxOb2RlU3VwcGxpZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldHVwU3RhdGUgPSBzZXR1cFJlc3VsdCBhcyBQcm9wZXJ0eU1hcDtcbiAgICB9XG4gIH1cblxuICB2bm9kZS5jb21wb25lbnQgPSBpbnN0YW5jZTtcblxuICBjb25zdCByZW5kZXJDb250ZXh0ID0gbmV3IFByb3h5KGluc3RhbmNlLCB7XG4gICAgZ2V0KHRhcmdldDogUHJvcGVydHlNYXAsIGtleTogUHJvcGVydHlLZXksIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgY29uc3QgeyBzdGF0ZSwgcHJvcHMgfSA9IHRhcmdldDtcbiAgICAgIGlmIChzdGF0ZSAmJiBrZXkgaW4gc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlW2tleV07XG4gICAgICB9IGVsc2UgaWYgKGtleSBpbiBwcm9wcykge1xuICAgICAgICByZXR1cm4gcHJvcHNba2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dXBTdGF0ZSAmJiBrZXkgaW4gc2V0dXBTdGF0ZSkge1xuICAgICAgICByZXR1cm4gc2V0dXBTdGF0ZVtrZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7U3RyaW5nKGtleSl9IG5vdCBleGlzdGVkYCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoXG4gICAgICB0YXJnZXQ6IFByb3BlcnR5TWFwLFxuICAgICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgIHZhbHVlOiBhbnksXG4gICAgICByZWNlaXZlcjogYW55XG4gICAgKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB7IHN0YXRlLCBwcm9wcyB9ID0gdGFyZ2V0O1xuICAgICAgaWYgKHN0YXRlICYmIGtleSBpbiBzdGF0ZSkge1xuICAgICAgICBzdGF0ZVtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChrZXkgaW4gcHJvcHMpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBhdHRlbXB0IHRvIG11dGF0ZSBwcm9wICR7U3RyaW5nKGtleSl9LCBwcm9wcyBhcmUgcmVhZG9ubHlgXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dXBTdGF0ZSAmJiBrZXkgaW4gc2V0dXBTdGF0ZSkge1xuICAgICAgICBzZXR1cFN0YXRlW2tleV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke1N0cmluZyhrZXkpfSBub3QgZXhpc3RlZGApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gYWZ0ZXIgY3JlYXRlXG4gIGNyZWF0ZWQgJiYgY3JlYXRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuXG4gIC8vIHJlYWN0aXZlXG4gIGVmZmVjdChcbiAgICAoKSA9PiB7XG4gICAgICBjb25zdCBzdWJUcmVlID0gcmVuZGVyLmNhbGwocmVuZGVyQ29udGV4dCk7XG4gICAgICBpZiAoIWluc3RhbmNlLmlzTW91bnRlZCkge1xuICAgICAgICBiZWZvcmVNb3VudCAmJiBiZWZvcmVNb3VudC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgICBwYXRjaChudWxsLCBzdWJUcmVlLCBjb250YWluZXIsIGFuY2hvcik7XG4gICAgICAgIGluc3RhbmNlLmlzTW91bnRlZCA9IHRydWU7XG4gICAgICAgIG1vdW50ZWQgJiYgbW91bnRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVmb3JlVXBkYXRlICYmIGJlZm9yZVVwZGF0ZS5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgICBwYXRjaChpbnN0YW5jZS5zdWJUcmVlLCBzdWJUcmVlLCBjb250YWluZXIsIGFuY2hvcik7XG4gICAgICAgIHVwZGF0ZWQgJiYgdXBkYXRlZC5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgfVxuICAgICAgaW5zdGFuY2Uuc3ViVHJlZSA9IHN1YlRyZWU7XG4gICAgfVxuICAgIC8vIHtcbiAgICAvLyAgIHNjaGVkdWxlcjogcXVldWVKb2IsXG4gICAgLy8gfVxuICApO1xufVxuIiwiaW1wb3J0IHsgSFRNTEVsZW1lbnRXaXRoVk5vZGUsIEhUTUxWaXJ0dWFsTm9kZSB9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IHBhdGNoIH0gZnJvbSBcIi4vcGF0Y2hcIjtcbmltcG9ydCB7IHVubW91bnQgfSBmcm9tIFwiLi9tb3VudFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXIoKSB7XG4gIGZ1bmN0aW9uIHJlbmRlcih2bm9kZTogSFRNTFZpcnR1YWxOb2RlLCBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aFZOb2RlKSB7XG4gICAgaWYgKHZub2RlKSB7XG4gICAgICBwYXRjaChjb250YWluZXIudm5vZGUsIHZub2RlLCBjb250YWluZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY29udGFpbmVyLnZub2RlKSB7XG4gICAgICAgIHVubW91bnQoY29udGFpbmVyLnZub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGFpbmVyLnZub2RlID0gdm5vZGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlbmRlcixcbiAgICBwYXRjaCxcbiAgfTtcbn1cbiIsImltcG9ydCB7IEhUTUxFbGVtZW50V2l0aFZOb2RlLCBIVE1MVmlydHVhbE5vZGUgfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBpbnNlcnQsIHNldEVsZW1lbnRUZXh0IH0gZnJvbSBcIi4vY29tbW9uXCI7XG5pbXBvcnQgeyBwYXRjaCwgcGF0Y2hQcm9wcyB9IGZyb20gXCIuL3BhdGNoXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudEVsZW1lbnQoXG4gIHZub2RlOiBIVE1MVmlydHVhbE5vZGUsXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnRXaXRoVk5vZGVcbikge1xuICBjb25zdCBlbCA9ICh2bm9kZS5lbCA9IGNyZWF0ZUVsZW1lbnQodm5vZGUudHlwZSBhcyBzdHJpbmcpKTtcblxuICAvLyBwcm9wc1xuICBpZiAodm5vZGUucHJvcHMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB2bm9kZS5wcm9wcykge1xuICAgICAgcGF0Y2hQcm9wcyhlbCwga2V5LCBudWxsLCB2bm9kZS5wcm9wc1trZXldKTtcbiAgICB9XG4gIH1cblxuICAvLyBjaGlsZHJlblxuICBpZiAodHlwZW9mIHZub2RlLmNoaWxkcmVuID09PSBcInN0cmluZ1wiKSB7XG4gICAgc2V0RWxlbWVudFRleHQoZWwsIHZub2RlLmNoaWxkcmVuKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSkge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBwYXRjaChudWxsLCBjaGlsZCwgZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgaW5zZXJ0KGVsLCBjb250YWluZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5tb3VudCh2bm9kZTogSFRNTFZpcnR1YWxOb2RlKSB7XG4gIGNvbnN0IGVsID0gdm5vZGUuZWw7XG4gIGNvbnN0IHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpO1xuICB9XG59XG4iLCJpbXBvcnQge1xuICBIVE1MRWxlbWVudERldGFpbCxcbiAgSFRNTEVsZW1lbnRXaXRoVk5vZGUsXG4gIEhUTUxWaXJ0dWFsTm9kZSxcbn0gZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgbW91bnRFbGVtZW50LCB1bm1vdW50IH0gZnJvbSBcIi4vbW91bnRcIjtcbmltcG9ydCB7IG1vdW50Q29tcG9uZW50LCBwYXRjaENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IHNldEVsZW1lbnRUZXh0IH0gZnJvbSBcIi4vY29tbW9uXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaFByb3BzKFxuICBlbDogSFRNTEVsZW1lbnREZXRhaWwsXG4gIGtleTogc3RyaW5nLFxuICBwcmV2VmFsdWU6IGFueSxcbiAgbmV4dFZhbHVlOiBhbnlcbikge1xuICBpZiAoL15vbi8udGVzdChrZXkpKSB7XG4gICAgY29uc3QgaW52b2tlcnMgPSBlbC52ZWkgfHwgKGVsLnZlaSA9IHt9KTtcbiAgICBsZXQgaW52b2tlciA9IGludm9rZXJzW2tleV07XG4gICAgY29uc3QgbmFtZSA9IGtleS5zbGljZSgyKS50b0xvd2VyQ2FzZSgpIGFzIGtleW9mIEhUTUxFbGVtZW50RXZlbnRNYXA7XG4gICAgaWYgKG5leHRWYWx1ZSkge1xuICAgICAgaWYgKCFpbnZva2VyKSB7XG4gICAgICAgIGludm9rZXIgPSBlbC52ZWlba2V5XSA9IChlKSA9PiB7XG4gICAgICAgICAgaWYgKGUudGltZVN0YW1wIDwgaW52b2tlci5hdHRhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnZva2VyLnZhbHVlKSkge1xuICAgICAgICAgICAgLy8gbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgICAgICAgIGludm9rZXIudmFsdWUuZm9yRWFjaCgoZm4pID0+IGZuKGUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW52b2tlci52YWx1ZShlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGludm9rZXIudmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgICAgIGludm9rZXIuYXR0YWNoZWQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBpbnZva2VyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZvciBlZmZpY2llbmN5XG4gICAgICAgIC8vIGF2b2lkIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2hlbiB1cGRhdGluZ1xuICAgICAgICBpbnZva2VyLnZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW52b2tlcikge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBpbnZva2VyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoa2V5ID09PSBcImNsYXNzXCIpIHtcbiAgICAvLyBmb3IgZWZmaWNpZW5jeVxuICAgIC8vIHNpbmNlIGBcImNsYXNzXCIgaW4gZWxgIGlzIGZhbHNlLCBhbmQgYHNldEF0dHJpYnV0ZWAgaXMgc2xvd2VyXG4gICAgZWwuY2xhc3NOYW1lID0gbmV4dFZhbHVlIHx8IFwiXCI7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGtleSBpbiBlbCkge1xuICAgICAgLy8gc2V0IERPTSBwcm9wZXJ0aWVzIGZpcnN0XG4gICAgICBjb25zdCB0eXBlID0gdHlwZW9mIGVsW2tleV07XG4gICAgICAvLyBoYW5kbGUgYnV0dG9uIGRpc2FibGVkXG4gICAgICBpZiAodHlwZSA9PT0gXCJib29sZWFuXCIgJiYgbmV4dFZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgIGVsW2tleV0gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxba2V5XSA9IG5leHRWYWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgbmV4dFZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihcbiAgbjE6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgbjI6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudERldGFpbFxuKSB7XG4gIGlmICh0eXBlb2YgbjIuY2hpbGRyZW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShuMS5jaGlsZHJlbikpIHtcbiAgICAgIG4xLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHVubW91bnQoYykpO1xuICAgIH1cbiAgICBzZXRFbGVtZW50VGV4dChjb250YWluZXIsIG4yLmNoaWxkcmVuKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG4yLmNoaWxkcmVuKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG4xLmNoaWxkcmVuKSkge1xuICAgICAgLy8gVE9ETyAtPiBmYXN0IGRpZmZcbiAgICAgIG4xLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHVubW91bnQoYykpO1xuICAgICAgbjIuY2hpbGRyZW4uZm9yRWFjaCgoYykgPT4gcGF0Y2gobnVsbCwgYywgY29udGFpbmVyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldEVsZW1lbnRUZXh0KGNvbnRhaW5lciwgXCJcIik7XG4gICAgICBuMi5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiBwYXRjaChudWxsLCBjLCBjb250YWluZXIpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobjEuY2hpbGRyZW4pKSB7XG4gICAgICBuMS5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiB1bm1vdW50KGMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuMS5jaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc2V0RWxlbWVudFRleHQoY29udGFpbmVyLCBcIlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hFbGVtZW50KG4xOiBIVE1MVmlydHVhbE5vZGUsIG4yOiBIVE1MVmlydHVhbE5vZGUpIHtcbiAgY29uc3QgZWwgPSAobjIuZWwgPSBuMS5lbCk7XG5cbiAgLy8gcHJvcHNcbiAgY29uc3Qgb2xkUHJvcHMgPSBuMS5wcm9wcztcbiAgY29uc3QgbmV3UHJvcHMgPSBuMi5wcm9wcztcbiAgZm9yIChjb25zdCBrZXkgaW4gbmV3UHJvcHMpIHtcbiAgICBpZiAobmV3UHJvcHNba2V5XSAhPT0gb2xkUHJvcHNba2V5XSkge1xuICAgICAgcGF0Y2hQcm9wcyhlbCwga2V5LCBvbGRQcm9wc1trZXldLCBuZXdQcm9wc1trZXldKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIShrZXkgaW4gbmV3UHJvcHMpKSB7XG4gICAgICBwYXRjaFByb3BzKGVsLCBrZXksIG9sZFByb3BzW2tleV0sIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNoaWxkcmVuXG4gIHBhdGNoQ2hpbGRyZW4objEsIG4yLCBlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaChcbiAgbjE6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgbjI6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudFdpdGhWTm9kZSxcbiAgYW5jaG9yPzogTm9kZVxuKSB7XG4gIGlmIChuMSAmJiBuMS50eXBlICE9PSBuMi50eXBlKSB7XG4gICAgdW5tb3VudChuMSk7XG4gICAgbjEgPSBudWxsO1xuICB9XG4gIGNvbnN0IHsgdHlwZSB9ID0gbjI7XG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIC8vIHRhZ1xuICAgIGlmICghbjEpIHtcbiAgICAgIG1vdW50RWxlbWVudChuMiwgY29udGFpbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2hFbGVtZW50KG4xLCBuMik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY29tcG9uZW50XG4gICAgaWYgKCFuMSkge1xuICAgICAgbW91bnRDb21wb25lbnQobjIsIGNvbnRhaW5lciwgYW5jaG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2hDb21wb25lbnQobjEsIG4yLCBhbmNob3IpO1xuICAgIH1cbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IGNyZWF0ZVJlbmRlcmVyIH0gZnJvbSBcIi4uL3NyYy9yZW5kZXJcIjtcbmltcG9ydCB7IENvbXBvbmVudE9wdGlvbnMgfSBmcm9tIFwiLi4vc3JjL3JlbmRlci9jb21wb25lbnRzXCI7XG5cbmNvbnN0IGFwcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwXCIpO1xuY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcigpO1xuY29uc3QgaW5wdXQ6IENvbXBvbmVudE9wdGlvbnMgPSB7XG4gIG5hbWU6IFwiZGVtb1wiLFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIlwiLFxuICAgIH07XG4gIH0sXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJkaXZcIixcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiBcImlucHV0XCIsXG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAoZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMudGV4dCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJwXCIsXG4gICAgICAgICAgY2hpbGRyZW46IGAke3RoaXMudGV4dH1gLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9LFxufTtcblxucmVuZGVyZXIucmVuZGVyKHsgdHlwZTogaW5wdXQgfSwgYXBwKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==