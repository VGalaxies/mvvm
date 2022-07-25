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
/*!****************************!*\
  !*** ./example/counter.ts ***!
  \****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var render_1 = __webpack_require__(/*! ../src/render */ "./src/render/index.ts");
var app = document.getElementById("app");
var renderer = (0, render_1.createRenderer)();
var counter = {
    name: "demo",
    data: function () {
        return {
            count: 0,
        };
    },
    render: function () {
        var _this = this;
        return {
            type: "button",
            props: {
                onClick: function () {
                    _this.count++;
                    console.log("".concat(_this.count));
                },
            },
            children: "".concat(this.count),
        };
    },
};
renderer.render({ type: counter }, app);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07WUFDTCwrQkFBYyxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDaEM7S0FDRjtBQUNILENBQUM7QUExQkQsc0JBMEJDOzs7Ozs7O1VDMUlEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSxpRkFBK0M7QUFHL0MsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxJQUFNLFFBQVEsR0FBRywyQkFBYyxHQUFFLENBQUM7QUFDbEMsSUFBTSxPQUFPLEdBQXFCO0lBQ2hDLElBQUksRUFBRSxNQUFNO0lBQ1osSUFBSTtRQUNGLE9BQU87WUFDTCxLQUFLLEVBQUUsQ0FBQztTQUNULENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTTtRQUFOLGlCQVdDO1FBVkMsT0FBTztZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRTtvQkFDUCxLQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFHLEtBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2FBQ0Y7WUFDRCxRQUFRLEVBQUUsVUFBRyxJQUFJLENBQUMsS0FBSyxDQUFFO1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQztBQUVGLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlYWN0aXZpdHkvZWZmZWN0LnRzIiwid2VicGFjazovL212dm0vLi9zcmMvcmVhY3Rpdml0eS9pbmRleC50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlYWN0aXZpdHkvdHlwZS50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlbmRlci9jb21tb24udHMiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9yZW5kZXIvY29tcG9uZW50cy50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlbmRlci9pbmRleC50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlbmRlci9tb3VudC50cyIsIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3JlbmRlci9wYXRjaC50cyIsIndlYnBhY2s6Ly9tdnZtL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL212dm0vLi9leGFtcGxlL2NvdW50ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW55U3VwcGxpZXIsIFByb3BlcnR5TWFwIH0gZnJvbSBcIi4uL3R5cGUvZ2xvYmFsXCI7XG5pbXBvcnQgeyBJVEVSQVRFX0tFWSwgVHJpZ2dlclR5cGUgfSBmcm9tIFwiLi90eXBlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWZmZWN0Rm4gZXh0ZW5kcyBBbnlTdXBwbGllciB7XG4gIGRlcHM6IEFycmF5PFNldDxFZmZlY3RGbj4+OyAvLyBmb3IgY2xlYW4gdXBcbiAgb3B0aW9ucz86IEVmZmVjdE9wdGlvbnM7XG59XG5cbnR5cGUgRWZmZWN0Rm5Db25zdW1lciA9IChhcmc/OiBFZmZlY3RGbikgPT4gdm9pZDtcblxuaW50ZXJmYWNlIEVmZmVjdE9wdGlvbnMge1xuICBzY2hlZHVsZXI/OiBFZmZlY3RGbkNvbnN1bWVyO1xuICBsYXp5PzogYm9vbGVhbjtcbn1cblxubGV0IGFjdGl2ZUVmZmVjdDogRWZmZWN0Rm4gPSBudWxsO1xuY29uc3QgZWZmZWN0U3RhY2s6IEFycmF5PEVmZmVjdEZuPiA9IFtdOyAvLyBmb3IgbmVzdGVkIGVmZmVjdHNcblxuY29uc3QgdGFyZ2V0TWFwID0gbmV3IFdlYWtNYXA8UHJvcGVydHlNYXAsIE1hcDxQcm9wZXJ0eUtleSwgU2V0PEVmZmVjdEZuPj4+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFjayh0YXJnZXQ6IFByb3BlcnR5TWFwLCBrZXk6IFByb3BlcnR5S2V5KSB7XG4gIGlmICghYWN0aXZlRWZmZWN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBkZXBzTWFwID0gdGFyZ2V0TWFwLmdldCh0YXJnZXQpO1xuICBpZiAoIWRlcHNNYXApIHtcbiAgICB0YXJnZXRNYXAuc2V0KHRhcmdldCwgKGRlcHNNYXAgPSBuZXcgTWFwPFByb3BlcnR5S2V5LCBTZXQ8RWZmZWN0Rm4+PigpKSk7XG4gIH1cbiAgbGV0IGRlcHMgPSBkZXBzTWFwLmdldChrZXkpO1xuICBpZiAoIWRlcHMpIHtcbiAgICBkZXBzTWFwLnNldChrZXksIChkZXBzID0gbmV3IFNldDxFZmZlY3RGbj4oKSkpO1xuICB9XG4gIGRlcHMuYWRkKGFjdGl2ZUVmZmVjdCk7XG4gIGFjdGl2ZUVmZmVjdC5kZXBzLnB1c2goZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyKFxuICB0YXJnZXQ6IFByb3BlcnR5TWFwLFxuICBrZXk6IFByb3BlcnR5S2V5LFxuICB0eXBlPzogVHJpZ2dlclR5cGVcbikge1xuICBjb25zdCBkZXBzTWFwID0gdGFyZ2V0TWFwLmdldCh0YXJnZXQpO1xuICBpZiAoIWRlcHNNYXApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlZmZlY3RzID0gZGVwc01hcC5nZXQoa2V5KTtcblxuICBjb25zdCBlZmZlY3RzVG9SdW4gPSBuZXcgU2V0PEVmZmVjdEZuPigpO1xuICBlZmZlY3RzICYmXG4gICAgZWZmZWN0cy5mb3JFYWNoKChlZmZlY3RGbikgPT4ge1xuICAgICAgLy8gZ2V0LWFuZC1zZXRcbiAgICAgIGlmIChlZmZlY3RGbiAhPT0gYWN0aXZlRWZmZWN0KSB7XG4gICAgICAgIGVmZmVjdHNUb1J1bi5hZGQoZWZmZWN0Rm4pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIGlmICh0eXBlID09PSBUcmlnZ2VyVHlwZS5BREQgfHwgdHlwZSA9PT0gVHJpZ2dlclR5cGUuREVMRVRFKSB7XG4gICAgLy8gZm9yIC4uLiBpblxuICAgIGNvbnN0IGl0ZXJhdGVFZmZlY3RzID0gZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpO1xuICAgIGl0ZXJhdGVFZmZlY3RzICYmXG4gICAgICBpdGVyYXRlRWZmZWN0cy5mb3JFYWNoKChlZmZlY3RGbikgPT4ge1xuICAgICAgICAvLyBnZXQtYW5kLXNldFxuICAgICAgICBpZiAoZWZmZWN0Rm4gIT09IGFjdGl2ZUVmZmVjdCkge1xuICAgICAgICAgIGVmZmVjdHNUb1J1bi5hZGQoZWZmZWN0Rm4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIGVmZmVjdHNUb1J1bi5mb3JFYWNoKChlZmZlY3RGbikgPT4ge1xuICAgIC8vIGludHJvIHNjaGVkdWxlclxuICAgIGlmIChlZmZlY3RGbi5vcHRpb25zLnNjaGVkdWxlcikge1xuICAgICAgZWZmZWN0Rm4ub3B0aW9ucy5zY2hlZHVsZXIoZWZmZWN0Rm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlZmZlY3RGbigpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFudXAoZWZmZWN0Rm46IEVmZmVjdEZuKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWZmZWN0Rm4uZGVwcy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGRlcHMgPSBlZmZlY3RGbi5kZXBzW2ldO1xuICAgIGRlcHMuZGVsZXRlKGVmZmVjdEZuKTtcbiAgfVxuICBlZmZlY3RGbi5kZXBzLmxlbmd0aCA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlZmZlY3QoZm46IEFueVN1cHBsaWVyLCBvcHRpb25zOiBFZmZlY3RPcHRpb25zID0ge30pOiBFZmZlY3RGbiB7XG4gIGNvbnN0IGVmZmVjdEZuOiBFZmZlY3RGbiA9ICgpID0+IHtcbiAgICBjbGVhbnVwKGVmZmVjdEZuKTtcbiAgICBhY3RpdmVFZmZlY3QgPSBlZmZlY3RGbjtcbiAgICBlZmZlY3RTdGFjay5wdXNoKGVmZmVjdEZuKTtcbiAgICBjb25zdCByZXMgPSBmbigpO1xuICAgIGVmZmVjdFN0YWNrLnBvcCgpO1xuICAgIGFjdGl2ZUVmZmVjdCA9IGVmZmVjdFN0YWNrW2VmZmVjdFN0YWNrLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiByZXM7XG4gIH07XG4gIGVmZmVjdEZuLm9wdGlvbnMgPSBvcHRpb25zO1xuICBlZmZlY3RGbi5kZXBzID0gW107XG4gIGlmICghb3B0aW9ucy5sYXp5KSB7XG4gICAgZWZmZWN0Rm4oKTtcbiAgfVxuICByZXR1cm4gZWZmZWN0Rm47XG59XG4iLCJpbXBvcnQgeyBQcm9wZXJ0eU1hcCB9IGZyb20gXCIuLi90eXBlL2dsb2JhbFwiO1xuaW1wb3J0IHsgdHJhY2ssIHRyaWdnZXIgfSBmcm9tIFwiLi9lZmZlY3RcIjtcbmltcG9ydCB7IElURVJBVEVfS0VZLCBUcmlnZ2VyVHlwZSB9IGZyb20gXCIuL3R5cGVcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWN0aXZlKHRhcmdldDogUHJvcGVydHlNYXApOiBQcm9wZXJ0eU1hcCB7XG4gIHJldHVybiBjcmVhdGVSZWFjdGl2ZSh0YXJnZXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd1JlYWN0aXZlKHRhcmdldDogUHJvcGVydHlNYXApOiBQcm9wZXJ0eU1hcCB7XG4gIHJldHVybiBjcmVhdGVSZWFjdGl2ZSh0YXJnZXQsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZG9ubHkodGFyZ2V0OiBQcm9wZXJ0eU1hcCk6IFByb3BlcnR5TWFwIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlKHRhcmdldCwgZmFsc2UsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd1JlYWRvbmx5KHRhcmdldDogUHJvcGVydHlNYXApOiBQcm9wZXJ0eU1hcCB7XG4gIHJldHVybiBjcmVhdGVSZWFjdGl2ZSh0YXJnZXQsIHRydWUsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZWFjdGl2ZShcbiAgdGFyZ2V0OiBQcm9wZXJ0eU1hcCxcbiAgaXNTaGFsbG93OiBib29sZWFuID0gZmFsc2UsXG4gIGlzUmVhZE9ubHk6IGJvb2xlYW4gPSBmYWxzZVxuKTogUHJvcGVydHlNYXAge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBnZXQodGFyZ2V0OiBQcm9wZXJ0eU1hcCwga2V5OiBQcm9wZXJ0eUtleSwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAvLyByZWFjdGl2ZShvYmopLnJhdyA9IG9ialxuICAgICAgaWYgKGtleSA9PT0gXCJyYXdcIikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgIHRyYWNrKHRhcmdldCwga2V5KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcyA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICBpZiAoaXNTaGFsbG93KSB7XG4gICAgICAgIC8vIHNoYWxsb3cgcmVhY3RpdmVcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcmVzID09PSBcIm9iamVjdFwiICYmIHJlcyAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gaXNSZWFkT25seSA/IHJlYWRvbmx5KHJlcykgOiByZWFjdGl2ZShyZXMpOyAvLyBkZWZhdWx0IC0+IGRlZXAgcmVhY3RpdmVcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcbiAgICBzZXQoXG4gICAgICB0YXJnZXQ6IFByb3BlcnR5TWFwLFxuICAgICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgIG5ld1ZhbHVlOiBhbnksXG4gICAgICByZWNlaXZlcjogYW55XG4gICAgKTogYm9vbGVhbiB7XG4gICAgICBpZiAoaXNSZWFkT25seSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgYXR0ciAke1N0cmluZyhrZXkpfSBpcyByZWFkIG9ubHlgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHRhcmdldFtrZXldO1xuICAgICAgY29uc3QgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSlcbiAgICAgICAgPyBUcmlnZ2VyVHlwZS5TRVRcbiAgICAgICAgOiBUcmlnZ2VyVHlwZS5BREQ7XG4gICAgICBjb25zdCByZXMgPSBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgbmV3VmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgIGlmIChcbiAgICAgICAgdGFyZ2V0ID09IHJlY2VpdmVyLnJhdyAmJiAvLyBwcm90b3R5cGUgaW5oZXJpdGFuY2VcbiAgICAgICAgb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmXG4gICAgICAgIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKSAvLyBOYU5cbiAgICAgICkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwga2V5LCB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0OiBQcm9wZXJ0eU1hcCwga2V5OiBQcm9wZXJ0eUtleSk6IGJvb2xlYW4ge1xuICAgICAgdHJhY2sodGFyZ2V0LCBrZXkpO1xuICAgICAgcmV0dXJuIFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KTtcbiAgICB9LFxuICAgIG93bktleXModGFyZ2V0OiBQcm9wZXJ0eU1hcCk6IChzdHJpbmcgfCBzeW1ib2wpW10ge1xuICAgICAgdHJhY2sodGFyZ2V0LCBJVEVSQVRFX0tFWSk7XG4gICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldCk7XG4gICAgfSxcbiAgICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQ6IFByb3BlcnR5TWFwLCBrZXk6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gICAgICBpZiAoaXNSZWFkT25seSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgYXR0ciAke1N0cmluZyhrZXkpfSBpcyByZWFkIG9ubHlgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBoYWRLZXkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpO1xuICAgICAgY29uc3QgcmVzID0gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSk7XG4gICAgICBpZiAocmVzICYmIGhhZEtleSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwga2V5LCBUcmlnZ2VyVHlwZS5ERUxFVEUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICB9O1xuICByZXR1cm4gbmV3IFByb3h5KHRhcmdldCwgaGFuZGxlcnMpO1xufVxuIiwiZXhwb3J0IGNvbnN0IElURVJBVEVfS0VZID0gU3ltYm9sKCk7XG5cbmV4cG9ydCBlbnVtIFRyaWdnZXJUeXBlIHtcbiAgU0VUID0gXCJTRVRcIixcbiAgQUREID0gXCJBRERcIixcbiAgREVMRVRFID0gXCJERUxFVEVcIixcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZzogc3RyaW5nKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRFbGVtZW50VGV4dChlbDogSFRNTEVsZW1lbnQsIHRleHQ6IHN0cmluZykge1xuICBlbC50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnQoZWw6IEhUTUxFbGVtZW50LCBwYXJlbnQ6IEhUTUxFbGVtZW50LCBhbmNob3I/OiBOb2RlKSB7XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIGFuY2hvcik7XG59XG4iLCJpbXBvcnQgeyBIVE1MRWxlbWVudFdpdGhWTm9kZSwgSFRNTFZpcnR1YWxOb2RlIH0gZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgUHJvcGVydHlNYXAsIFN1cHBsaWVyLCBWb2lkU3VwcGxpZXIgfSBmcm9tIFwiLi4vdHlwZS9nbG9iYWxcIjtcbmltcG9ydCB7IGVmZmVjdCB9IGZyb20gXCIuLi9yZWFjdGl2aXR5L2VmZmVjdFwiO1xuaW1wb3J0IHsgcGF0Y2ggfSBmcm9tIFwiLi9wYXRjaFwiO1xuaW1wb3J0IHsgcmVhY3RpdmUsIHNoYWxsb3dSZWFjdGl2ZSwgc2hhbGxvd1JlYWRvbmx5IH0gZnJvbSBcIi4uL3JlYWN0aXZpdHlcIjtcblxudHlwZSBWaXJ0dWFsTm9kZVN1cHBsaWVyID0gU3VwcGxpZXI8SFRNTFZpcnR1YWxOb2RlPjtcbnR5cGUgUHJvcGVydHlNYXBTdXBwbGllciA9IFN1cHBsaWVyPFByb3BlcnR5TWFwPjtcblxudHlwZSBFdmVudEVtaXR0ZXIgPSAoZXZlbnQ6IHN0cmluZywgLi4uYXJnczogYW55KSA9PiB2b2lkO1xuXG5pbnRlcmZhY2UgU2V0dXBDb250ZXh0IHtcbiAgYXR0cnM/OiBQcm9wZXJ0eU1hcDtcbiAgZW1pdD86IEV2ZW50RW1pdHRlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRPcHRpb25zIHtcbiAgbmFtZTogc3RyaW5nO1xuICByZW5kZXI/OiBWaXJ0dWFsTm9kZVN1cHBsaWVyO1xuICBkYXRhPzogUHJvcGVydHlNYXBTdXBwbGllcjtcbiAgcHJvcHM/OiBQcm9wZXJ0eU1hcDtcbiAgc2V0dXA/OiAoXG4gICAgcHJvcHM6IFByb3BlcnR5TWFwLFxuICAgIGNvbnRleHQ6IFNldHVwQ29udGV4dFxuICApID0+IFZpcnR1YWxOb2RlU3VwcGxpZXIgfCBQcm9wZXJ0eU1hcDtcblxuICAvLyBob29rc1xuICBiZWZvcmVDcmVhdGU/OiBWb2lkU3VwcGxpZXI7XG4gIGNyZWF0ZWQ/OiBWb2lkU3VwcGxpZXI7XG4gIGJlZm9yZU1vdW50PzogVm9pZFN1cHBsaWVyO1xuICBtb3VudGVkPzogVm9pZFN1cHBsaWVyO1xuICBiZWZvcmVVcGRhdGU/OiBWb2lkU3VwcGxpZXI7XG4gIHVwZGF0ZWQ/OiBWb2lkU3VwcGxpZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50SW5zdGFuY2Uge1xuICBzdGF0ZTogUHJvcGVydHlNYXA7IC8vIGRlZXAgcmVhY3RpdmVcbiAgcHJvcHM6IFByb3BlcnR5TWFwOyAvLyBzaGFsbG93IHJlYWN0aXZlXG4gIGlzTW91bnRlZDogYm9vbGVhbjtcbiAgc3ViVHJlZTogSFRNTFZpcnR1YWxOb2RlO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUHJvcHMob3B0aW9uczogUHJvcGVydHlNYXAsIHByb3BzRGF0YTogUHJvcGVydHlNYXApIHtcbiAgY29uc3QgcHJvcHM6IFByb3BlcnR5TWFwID0ge307XG4gIGNvbnN0IGF0dHJzOiBQcm9wZXJ0eU1hcCA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wc0RhdGEpIHtcbiAgICBpZiAoKG9wdGlvbnMgJiYga2V5IGluIG9wdGlvbnMpIHx8IGtleS5zdGFydHNXaXRoKFwib25cIikpIHtcbiAgICAgIC8vIGRlZmluZWQgaW4gYENvbXBvbmVudE9wdGlvbnMucHJvcHNgIG9yIGV2ZW50IGhhbmRsZXJcbiAgICAgIHByb3BzW2tleV0gPSBwcm9wc0RhdGFba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbm90IGRlZmluZWQgaW4gYENvbXBvbmVudE9wdGlvbnMucHJvcHNgXG4gICAgICBhdHRyc1trZXldID0gcHJvcHNEYXRhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBbcHJvcHMsIGF0dHJzXTtcbn1cblxuZnVuY3Rpb24gaGFzUHJvcHNDaGFuZ2VkKFxuICBwcmV2UHJvcHM6IFByb3BlcnR5TWFwLFxuICBuZXh0UHJvcHM6IFByb3BlcnR5TWFwXG4pOiBib29sZWFuIHtcbiAgY29uc3QgbmV4dEtleXMgPSBPYmplY3Qua2V5cyhuZXh0UHJvcHMpO1xuICBjb25zdCBwcmV2S2V5cyA9IE9iamVjdC5rZXlzKHByZXZQcm9wcyk7XG4gIGlmIChuZXh0S2V5cy5sZW5ndGggIT09IHByZXZLZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEtleXMubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBrZXkgPSBuZXh0S2V5c1tpXTtcbiAgICBpZiAobmV4dFByb3BzW2tleV0gIT09IHByZXZQcm9wc1trZXldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hDb21wb25lbnQoXG4gIG4xOiBIVE1MVmlydHVhbE5vZGUsXG4gIG4yOiBIVE1MVmlydHVhbE5vZGUsXG4gIGFuY2hvcj86IE5vZGVcbikge1xuICBjb25zdCBpbnN0YW5jZSA9IChuMi5jb21wb25lbnQgPSBuMS5jb21wb25lbnQpO1xuICBjb25zdCB7IHByb3BzIH0gPSBpbnN0YW5jZTsgLy8gc2hhbGxvdyByZWFjdGl2ZVxuICBpZiAoaGFzUHJvcHNDaGFuZ2VkKG4xLnByb3BzLCBuMi5wcm9wcykpIHtcbiAgICBjb25zdCBbbmV4dFByb3BzXSA9IHJlc29sdmVQcm9wcyhcbiAgICAgIChuMi50eXBlIGFzIENvbXBvbmVudE9wdGlvbnMpLnByb3BzLFxuICAgICAgbjIucHJvcHNcbiAgICApO1xuICAgIGZvciAoY29uc3Qga2V5IGluIG5leHRQcm9wcykge1xuICAgICAgcHJvcHNba2V5XSA9IG5leHRQcm9wc1trZXldO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wcykge1xuICAgICAgaWYgKCEoa2V5IGluIG5leHRQcm9wcykpIHtcbiAgICAgICAgZGVsZXRlIHByb3BzW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3VudENvbXBvbmVudChcbiAgdm5vZGU6IEhUTUxWaXJ0dWFsTm9kZSxcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudFdpdGhWTm9kZSxcbiAgYW5jaG9yPzogTm9kZVxuKSB7XG4gIC8vIGZldGNoIG9wdGlvbnNcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IHZub2RlLnR5cGUgYXMgQ29tcG9uZW50T3B0aW9ucztcbiAgbGV0IHsgcmVuZGVyIH0gPSBjb21wb25lbnRPcHRpb25zO1xuICBjb25zdCB7XG4gICAgZGF0YSxcbiAgICBwcm9wczogcHJvcHNPcHRpb24sXG4gICAgc2V0dXAsXG5cbiAgICBiZWZvcmVDcmVhdGUsXG4gICAgY3JlYXRlZCxcbiAgICBiZWZvcmVNb3VudCxcbiAgICBtb3VudGVkLFxuICAgIGJlZm9yZVVwZGF0ZSxcbiAgICB1cGRhdGVkLFxuICB9ID0gY29tcG9uZW50T3B0aW9ucztcblxuICAvLyBiZWZvcmUgY3JlYXRlXG4gIGJlZm9yZUNyZWF0ZSAmJiBiZWZvcmVDcmVhdGUoKTtcblxuICAvLyBjcmVhdGUgaW5zdGFuY2VcbiAgY29uc3QgaW5zdGFuY2U6IENvbXBvbmVudEluc3RhbmNlID0ge1xuICAgIHN0YXRlOiB7fSxcbiAgICBwcm9wczoge30sXG4gICAgaXNNb3VudGVkOiBmYWxzZSxcbiAgICBzdWJUcmVlOiBudWxsLFxuICB9O1xuXG4gIGluc3RhbmNlLnN0YXRlID0gcmVhY3RpdmUoZGF0YSA/IGRhdGEoKSA6IHt9KTtcblxuICBjb25zdCBbcHJvcHMsIGF0dHJzXSA9IHJlc29sdmVQcm9wcyhwcm9wc09wdGlvbiwgdm5vZGUucHJvcHMpO1xuICBpbnN0YW5jZS5wcm9wcyA9IHNoYWxsb3dSZWFjdGl2ZShwcm9wcyk7XG5cbiAgLy8gc2V0dXBcbiAgZnVuY3Rpb24gZW1pdChldmVudDogc3RyaW5nLCAuLi5hcmdzOiBhbnkpIHtcbiAgICAvLyBjbGljayAtPiBvbkNsaWNrXG4gICAgY29uc3QgZXZlbnROYW1lID0gYG9uJHtldmVudFswXS50b1VwcGVyQ2FzZSgpICsgZXZlbnQuc2xpY2UoMSl9YDtcbiAgICBjb25zdCBoYW5kbGVyID0gaW5zdGFuY2UucHJvcHNbZXZlbnROYW1lXTtcbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgaGFuZGxlciguLi5hcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coYCR7U3RyaW5nKGV2ZW50KX0gbm90IGV4aXN0ZWRgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzZXR1cENvbnRleHQ6IFNldHVwQ29udGV4dCA9IHtcbiAgICBhdHRycyxcbiAgICBlbWl0LFxuICB9O1xuICBsZXQgc2V0dXBTdGF0ZTogUHJvcGVydHlNYXAgPSBudWxsO1xuICBpZiAoc2V0dXApIHtcbiAgICBjb25zdCBzZXR1cFJlc3VsdCA9IHNldHVwKHNoYWxsb3dSZWFkb25seShpbnN0YW5jZS5wcm9wcyksIHNldHVwQ29udGV4dCk7XG4gICAgaWYgKHR5cGVvZiBzZXR1cFJlc3VsdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBpZiAocmVuZGVyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZXR1cCByZXR1cm4gcmVuZGVyIGZ1bmN0aW9uLCBpZ25vcmUgcmVuZGVyIG9wdGlvbnNcIik7XG4gICAgICB9XG4gICAgICByZW5kZXIgPSBzZXR1cFJlc3VsdCBhcyBWaXJ0dWFsTm9kZVN1cHBsaWVyO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXR1cFN0YXRlID0gc2V0dXBSZXN1bHQgYXMgUHJvcGVydHlNYXA7XG4gICAgfVxuICB9XG5cbiAgdm5vZGUuY29tcG9uZW50ID0gaW5zdGFuY2U7XG5cbiAgY29uc3QgcmVuZGVyQ29udGV4dCA9IG5ldyBQcm94eShpbnN0YW5jZSwge1xuICAgIGdldCh0YXJnZXQ6IFByb3BlcnR5TWFwLCBrZXk6IFByb3BlcnR5S2V5LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgIGNvbnN0IHsgc3RhdGUsIHByb3BzIH0gPSB0YXJnZXQ7XG4gICAgICBpZiAoc3RhdGUgJiYga2V5IGluIHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZVtrZXldO1xuICAgICAgfSBlbHNlIGlmIChrZXkgaW4gcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIHByb3BzW2tleV07XG4gICAgICB9IGVsc2UgaWYgKHNldHVwU3RhdGUgJiYga2V5IGluIHNldHVwU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHNldHVwU3RhdGVba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke1N0cmluZyhrZXkpfSBub3QgZXhpc3RlZGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KFxuICAgICAgdGFyZ2V0OiBQcm9wZXJ0eU1hcCxcbiAgICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgICB2YWx1ZTogYW55LFxuICAgICAgcmVjZWl2ZXI6IGFueVxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgeyBzdGF0ZSwgcHJvcHMgfSA9IHRhcmdldDtcbiAgICAgIGlmIChzdGF0ZSAmJiBrZXkgaW4gc3RhdGUpIHtcbiAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5IGluIHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgYXR0ZW1wdCB0byBtdXRhdGUgcHJvcCAke1N0cmluZyhrZXkpfSwgcHJvcHMgYXJlIHJlYWRvbmx5YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHNldHVwU3RhdGUgJiYga2V5IGluIHNldHVwU3RhdGUpIHtcbiAgICAgICAgc2V0dXBTdGF0ZVtrZXldID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtTdHJpbmcoa2V5KX0gbm90IGV4aXN0ZWRgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIGFmdGVyIGNyZWF0ZVxuICBjcmVhdGVkICYmIGNyZWF0ZWQuY2FsbChyZW5kZXJDb250ZXh0KTtcblxuICAvLyByZWFjdGl2ZVxuICBlZmZlY3QoXG4gICAgKCkgPT4ge1xuICAgICAgY29uc3Qgc3ViVHJlZSA9IHJlbmRlci5jYWxsKHJlbmRlckNvbnRleHQpO1xuICAgICAgaWYgKCFpbnN0YW5jZS5pc01vdW50ZWQpIHtcbiAgICAgICAgYmVmb3JlTW91bnQgJiYgYmVmb3JlTW91bnQuY2FsbChyZW5kZXJDb250ZXh0KTtcbiAgICAgICAgcGF0Y2gobnVsbCwgc3ViVHJlZSwgY29udGFpbmVyLCBhbmNob3IpO1xuICAgICAgICBpbnN0YW5jZS5pc01vdW50ZWQgPSB0cnVlO1xuICAgICAgICBtb3VudGVkICYmIG1vdW50ZWQuY2FsbChyZW5kZXJDb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlZm9yZVVwZGF0ZSAmJiBiZWZvcmVVcGRhdGUuY2FsbChyZW5kZXJDb250ZXh0KTtcbiAgICAgICAgcGF0Y2goaW5zdGFuY2Uuc3ViVHJlZSwgc3ViVHJlZSwgY29udGFpbmVyLCBhbmNob3IpO1xuICAgICAgICB1cGRhdGVkICYmIHVwZGF0ZWQuY2FsbChyZW5kZXJDb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIGluc3RhbmNlLnN1YlRyZWUgPSBzdWJUcmVlO1xuICAgIH1cbiAgICAvLyB7XG4gICAgLy8gICBzY2hlZHVsZXI6IHF1ZXVlSm9iLFxuICAgIC8vIH1cbiAgKTtcbn1cbiIsImltcG9ydCB7IEhUTUxFbGVtZW50V2l0aFZOb2RlLCBIVE1MVmlydHVhbE5vZGUgfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBwYXRjaCB9IGZyb20gXCIuL3BhdGNoXCI7XG5pbXBvcnQgeyB1bm1vdW50IH0gZnJvbSBcIi4vbW91bnRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKCkge1xuICBmdW5jdGlvbiByZW5kZXIodm5vZGU6IEhUTUxWaXJ0dWFsTm9kZSwgY29udGFpbmVyOiBIVE1MRWxlbWVudFdpdGhWTm9kZSkge1xuICAgIGlmICh2bm9kZSkge1xuICAgICAgcGF0Y2goY29udGFpbmVyLnZub2RlLCB2bm9kZSwgY29udGFpbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNvbnRhaW5lci52bm9kZSkge1xuICAgICAgICB1bm1vdW50KGNvbnRhaW5lci52bm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRhaW5lci52bm9kZSA9IHZub2RlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIsXG4gICAgcGF0Y2gsXG4gIH07XG59XG4iLCJpbXBvcnQgeyBIVE1MRWxlbWVudFdpdGhWTm9kZSwgSFRNTFZpcnR1YWxOb2RlIH0gZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgaW5zZXJ0LCBzZXRFbGVtZW50VGV4dCB9IGZyb20gXCIuL2NvbW1vblwiO1xuaW1wb3J0IHsgcGF0Y2gsIHBhdGNoUHJvcHMgfSBmcm9tIFwiLi9wYXRjaFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRFbGVtZW50KFxuICB2bm9kZTogSFRNTFZpcnR1YWxOb2RlLFxuICBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aFZOb2RlXG4pIHtcbiAgY29uc3QgZWwgPSAodm5vZGUuZWwgPSBjcmVhdGVFbGVtZW50KHZub2RlLnR5cGUgYXMgc3RyaW5nKSk7XG5cbiAgLy8gcHJvcHNcbiAgaWYgKHZub2RlLnByb3BzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdm5vZGUucHJvcHMpIHtcbiAgICAgIHBhdGNoUHJvcHMoZWwsIGtleSwgbnVsbCwgdm5vZGUucHJvcHNba2V5XSk7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hpbGRyZW5cbiAgaWYgKHR5cGVvZiB2bm9kZS5jaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIHNldEVsZW1lbnRUZXh0KGVsLCB2bm9kZS5jaGlsZHJlbik7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2bm9kZS5jaGlsZHJlbikpIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgcGF0Y2gobnVsbCwgY2hpbGQsIGVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGluc2VydChlbCwgY29udGFpbmVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVubW91bnQodm5vZGU6IEhUTUxWaXJ0dWFsTm9kZSkge1xuICBjb25zdCBlbCA9IHZub2RlLmVsO1xuICBjb25zdCBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSB7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtcbiAgSFRNTEVsZW1lbnREZXRhaWwsXG4gIEhUTUxFbGVtZW50V2l0aFZOb2RlLFxuICBIVE1MVmlydHVhbE5vZGUsXG59IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IG1vdW50RWxlbWVudCwgdW5tb3VudCB9IGZyb20gXCIuL21vdW50XCI7XG5pbXBvcnQgeyBtb3VudENvbXBvbmVudCwgcGF0Y2hDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBzZXRFbGVtZW50VGV4dCB9IGZyb20gXCIuL2NvbW1vblwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hQcm9wcyhcbiAgZWw6IEhUTUxFbGVtZW50RGV0YWlsLFxuICBrZXk6IHN0cmluZyxcbiAgcHJldlZhbHVlOiBhbnksXG4gIG5leHRWYWx1ZTogYW55XG4pIHtcbiAgaWYgKC9eb24vLnRlc3Qoa2V5KSkge1xuICAgIGNvbnN0IGludm9rZXJzID0gZWwudmVpIHx8IChlbC52ZWkgPSB7fSk7XG4gICAgbGV0IGludm9rZXIgPSBpbnZva2Vyc1trZXldO1xuICAgIGNvbnN0IG5hbWUgPSBrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSBhcyBrZXlvZiBIVE1MRWxlbWVudEV2ZW50TWFwO1xuICAgIGlmIChuZXh0VmFsdWUpIHtcbiAgICAgIGlmICghaW52b2tlcikge1xuICAgICAgICBpbnZva2VyID0gZWwudmVpW2tleV0gPSAoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLnRpbWVTdGFtcCA8IGludm9rZXIuYXR0YWNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW52b2tlci52YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIG11bHRpcGxlIGhhbmRsZXJzXG4gICAgICAgICAgICBpbnZva2VyLnZhbHVlLmZvckVhY2goKGZuKSA9PiBmbihlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGludm9rZXIudmFsdWUoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpbnZva2VyLnZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgICBpbnZva2VyLmF0dGFjaGVkID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgaW52b2tlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmb3IgZWZmaWNpZW5jeVxuICAgICAgICAvLyBhdm9pZCByZW1vdmVFdmVudExpc3RlbmVyIHdoZW4gdXBkYXRpbmdcbiAgICAgICAgaW52b2tlci52YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGludm9rZXIpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgaW52b2tlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJjbGFzc1wiKSB7XG4gICAgLy8gZm9yIGVmZmljaWVuY3lcbiAgICAvLyBzaW5jZSBgXCJjbGFzc1wiIGluIGVsYCBpcyBmYWxzZSwgYW5kIGBzZXRBdHRyaWJ1dGVgIGlzIHNsb3dlclxuICAgIGVsLmNsYXNzTmFtZSA9IG5leHRWYWx1ZSB8fCBcIlwiO1xuICB9IGVsc2Uge1xuICAgIGlmIChrZXkgaW4gZWwpIHtcbiAgICAgIC8vIHNldCBET00gcHJvcGVydGllcyBmaXJzdFxuICAgICAgY29uc3QgdHlwZSA9IHR5cGVvZiBlbFtrZXldO1xuICAgICAgLy8gaGFuZGxlIGJ1dHRvbiBkaXNhYmxlZFxuICAgICAgaWYgKHR5cGUgPT09IFwiYm9vbGVhblwiICYmIG5leHRWYWx1ZSA9PT0gXCJcIikge1xuICAgICAgICBlbFtrZXldID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsW2tleV0gPSBuZXh0VmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIG5leHRWYWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oXG4gIG4xOiBIVE1MVmlydHVhbE5vZGUsXG4gIG4yOiBIVE1MVmlydHVhbE5vZGUsXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnREZXRhaWxcbikge1xuICBpZiAodHlwZW9mIG4yLmNoaWxkcmVuID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobjEuY2hpbGRyZW4pKSB7XG4gICAgICBuMS5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiB1bm1vdW50KGMpKTtcbiAgICB9XG4gICAgc2V0RWxlbWVudFRleHQoY29udGFpbmVyLCBuMi5jaGlsZHJlbik7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShuMi5jaGlsZHJlbikpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShuMS5jaGlsZHJlbikpIHtcbiAgICAgIC8vIFRPRE8gLT4gZmFzdCBkaWZmXG4gICAgICBuMS5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiB1bm1vdW50KGMpKTtcbiAgICAgIG4yLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHBhdGNoKG51bGwsIGMsIGNvbnRhaW5lcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRFbGVtZW50VGV4dChjb250YWluZXIsIFwiXCIpO1xuICAgICAgbjIuY2hpbGRyZW4uZm9yRWFjaCgoYykgPT4gcGF0Y2gobnVsbCwgYywgY29udGFpbmVyKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG4xLmNoaWxkcmVuKSkge1xuICAgICAgbjEuY2hpbGRyZW4uZm9yRWFjaCgoYykgPT4gdW5tb3VudChjKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbjEuY2hpbGRyZW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHNldEVsZW1lbnRUZXh0KGNvbnRhaW5lciwgXCJcIik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhdGNoRWxlbWVudChuMTogSFRNTFZpcnR1YWxOb2RlLCBuMjogSFRNTFZpcnR1YWxOb2RlKSB7XG4gIGNvbnN0IGVsID0gKG4yLmVsID0gbjEuZWwpO1xuXG4gIC8vIHByb3BzXG4gIGNvbnN0IG9sZFByb3BzID0gbjEucHJvcHM7XG4gIGNvbnN0IG5ld1Byb3BzID0gbjIucHJvcHM7XG4gIGZvciAoY29uc3Qga2V5IGluIG5ld1Byb3BzKSB7XG4gICAgaWYgKG5ld1Byb3BzW2tleV0gIT09IG9sZFByb3BzW2tleV0pIHtcbiAgICAgIHBhdGNoUHJvcHMoZWwsIGtleSwgb2xkUHJvcHNba2V5XSwgbmV3UHJvcHNba2V5XSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIG9sZFByb3BzKSB7XG4gICAgaWYgKCEoa2V5IGluIG5ld1Byb3BzKSkge1xuICAgICAgcGF0Y2hQcm9wcyhlbCwga2V5LCBvbGRQcm9wc1trZXldLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICAvLyBjaGlsZHJlblxuICBwYXRjaENoaWxkcmVuKG4xLCBuMiwgZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2goXG4gIG4xOiBIVE1MVmlydHVhbE5vZGUsXG4gIG4yOiBIVE1MVmlydHVhbE5vZGUsXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnRXaXRoVk5vZGUsXG4gIGFuY2hvcj86IE5vZGVcbikge1xuICBpZiAobjEgJiYgbjEudHlwZSAhPT0gbjIudHlwZSkge1xuICAgIHVubW91bnQobjEpO1xuICAgIG4xID0gbnVsbDtcbiAgfVxuICBjb25zdCB7IHR5cGUgfSA9IG4yO1xuICBpZiAodHlwZW9mIHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAvLyB0YWdcbiAgICBpZiAoIW4xKSB7XG4gICAgICBtb3VudEVsZW1lbnQobjIsIGNvbnRhaW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGNoRWxlbWVudChuMSwgbjIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgIC8vIGNvbXBvbmVudFxuICAgIGlmICghbjEpIHtcbiAgICAgIG1vdW50Q29tcG9uZW50KG4yLCBjb250YWluZXIsIGFuY2hvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGNoQ29tcG9uZW50KG4xLCBuMiwgYW5jaG9yKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBjcmVhdGVSZW5kZXJlciB9IGZyb20gXCIuLi9zcmMvcmVuZGVyXCI7XG5pbXBvcnQgeyBDb21wb25lbnRPcHRpb25zIH0gZnJvbSBcIi4uL3NyYy9yZW5kZXIvY29tcG9uZW50c1wiO1xuXG5jb25zdCBhcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKTtcbmNvbnN0IGNvdW50ZXI6IENvbXBvbmVudE9wdGlvbnMgPSB7XG4gIG5hbWU6IFwiZGVtb1wiLFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb3VudDogMCxcbiAgICB9O1xuICB9LFxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICBwcm9wczoge1xuICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuY291bnR9YCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2hpbGRyZW46IGAke3RoaXMuY291bnR9YCxcbiAgICB9O1xuICB9LFxufTtcblxucmVuZGVyZXIucmVuZGVyKHsgdHlwZTogY291bnRlciB9LCBhcHApO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9