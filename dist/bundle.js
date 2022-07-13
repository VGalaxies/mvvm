/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/runtime-core.ts":
/*!*****************************!*\
  !*** ./src/runtime-core.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patch = exports.mount = exports.h = void 0;
function h(tag, props, children) {
    return {
        tag: tag,
        props: props,
        children: children,
    };
}
exports.h = h;
function mount(vnode, container) {
    var tag = vnode.tag, props = vnode.props, children = vnode.children;
    var el = (vnode.el = document.createElement(tag));
    // props
    if (props) {
        for (var key in props) {
            var value = props[key];
            el.setAttribute(key, value);
        }
    }
    // children
    if (children) {
        if (typeof children === "string") {
            container.innerHTML = children;
        }
        else {
            children.forEach(function (child) {
                mount(child, el);
            });
        }
    }
    container.append(el);
}
exports.mount = mount;
function patch(n1, n2) {
    if (n1.tag === n2.tag) {
        var el_1 = (n2.el = n1.el);
        // props
        var oldProps = n1.props || {};
        var newProps = n2.props || {};
        for (var key in newProps) {
            var oldValue = oldProps[key];
            var newValue = newProps[key];
            if (newValue !== oldValue) {
                el_1.setAttribute(key, newValue);
            }
        }
        for (var key in oldProps) {
            if (!(key in newProps)) {
                el_1.removeAttribute(key);
            }
        }
        // children
        var oldChildren = n1.children;
        var newChildren = n2.children;
        if (typeof newChildren === "string") {
            if (typeof oldChildren === "string") {
                if (oldChildren !== newChildren) {
                    // for efficiency
                    el_1.innerHTML = newChildren;
                }
            }
            else {
                el_1.innerHTML = newChildren;
            }
        }
        else if (typeof oldChildren === "string" && Array.isArray(newChildren)) {
            el_1.innerHTML = "";
            newChildren.forEach(function (child) { return mount(child, el_1); });
        }
        else if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
            var minLength = Math.min(oldChildren.length, newChildren.length);
            for (var i = 0; i < minLength; i++) {
                patch(oldChildren[i], newChildren[i]); // recursion here
            }
            if (oldChildren.length === minLength) {
                for (var i = minLength; i < newChildren.length; i++) {
                    mount(newChildren[i], el_1);
                }
            }
            else {
                for (var i = minLength; i < oldChildren.length; i++) {
                    el_1.removeChild(oldChildren[i].el);
                }
            }
        }
    }
    else {
        // do nothing now
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
var runtime_core_1 = __webpack_require__(/*! ./runtime-core */ "./src/runtime-core.ts");
var vdom1 = (0, runtime_core_1.h)("div", { class: "red" }, [(0, runtime_core_1.h)("span", null, "hello")]);
(0, runtime_core_1.mount)(vdom1, document.getElementById("app"));
var vdom2 = (0, runtime_core_1.h)("div", { class: "red" }, [(0, runtime_core_1.h)("span", null, "hello")]);
(0, runtime_core_1.patch)(vdom1, vdom2);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNILENBQUM7QUF2REQsc0JBdURDOzs7Ozs7O1VDcEdEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSx3RkFBaUQ7QUFFakQsSUFBTSxLQUFLLEdBQUcsb0JBQUMsRUFBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxvQkFBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLHdCQUFLLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM3QyxJQUFNLEtBQUssR0FBRyxvQkFBQyxFQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLG9CQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsd0JBQUssRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tdnZtLy4vc3JjL3J1bnRpbWUtY29yZS50cyIsIndlYnBhY2s6Ly9tdnZtL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL212dm0vLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgVk5vZGUge1xuICB0YWc6IHN0cmluZztcbiAgcHJvcHM6IGFueTtcbiAgY2hpbGRyZW46IHN0cmluZyB8IEFycmF5PFZOb2RlPjtcbiAgZWw/OiBIVE1MRWxlbWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGgoXG4gIHRhZzogc3RyaW5nLFxuICBwcm9wczogYW55LFxuICBjaGlsZHJlbjogc3RyaW5nIHwgQXJyYXk8Vk5vZGU+XG4pOiBWTm9kZSB7XG4gIHJldHVybiB7XG4gICAgdGFnLFxuICAgIHByb3BzLFxuICAgIGNoaWxkcmVuLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnQodm5vZGU6IFZOb2RlLCBjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IHsgdGFnLCBwcm9wcywgY2hpbGRyZW4gfSA9IHZub2RlO1xuICBjb25zdCBlbCA9ICh2bm9kZS5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG5cbiAgLy8gcHJvcHNcbiAgaWYgKHByb3BzKSB7XG4gICAgZm9yIChsZXQga2V5IGluIHByb3BzKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHByb3BzW2tleV07XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hpbGRyZW5cbiAgaWYgKGNoaWxkcmVuKSB7XG4gICAgaWYgKHR5cGVvZiBjaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGNoaWxkcmVuO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICBtb3VudChjaGlsZCwgZWwpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29udGFpbmVyLmFwcGVuZChlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaChuMTogVk5vZGUsIG4yOiBWTm9kZSkge1xuICBpZiAobjEudGFnID09PSBuMi50YWcpIHtcbiAgICBjb25zdCBlbCA9IChuMi5lbCA9IG4xLmVsKTtcblxuICAgIC8vIHByb3BzXG4gICAgY29uc3Qgb2xkUHJvcHMgPSBuMS5wcm9wcyB8fCB7fTtcbiAgICBjb25zdCBuZXdQcm9wcyA9IG4yLnByb3BzIHx8IHt9O1xuICAgIGZvciAobGV0IGtleSBpbiBuZXdQcm9wcykge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRQcm9wc1trZXldO1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBuZXdQcm9wc1trZXldO1xuICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IGluIG9sZFByb3BzKSB7XG4gICAgICBpZiAoIShrZXkgaW4gbmV3UHJvcHMpKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoaWxkcmVuXG4gICAgY29uc3Qgb2xkQ2hpbGRyZW4gPSBuMS5jaGlsZHJlbjtcbiAgICBjb25zdCBuZXdDaGlsZHJlbiA9IG4yLmNoaWxkcmVuO1xuXG4gICAgaWYgKHR5cGVvZiBuZXdDaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKHR5cGVvZiBvbGRDaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAob2xkQ2hpbGRyZW4gIT09IG5ld0NoaWxkcmVuKSB7XG4gICAgICAgICAgLy8gZm9yIGVmZmljaWVuY3lcbiAgICAgICAgICBlbC5pbm5lckhUTUwgPSBuZXdDaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gbmV3Q2hpbGRyZW47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2xkQ2hpbGRyZW4gPT09IFwic3RyaW5nXCIgJiYgQXJyYXkuaXNBcnJheShuZXdDaGlsZHJlbikpIHtcbiAgICAgIGVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICBuZXdDaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gbW91bnQoY2hpbGQsIGVsKSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9sZENoaWxkcmVuKSAmJiBBcnJheS5pc0FycmF5KG5ld0NoaWxkcmVuKSkge1xuICAgICAgY29uc3QgbWluTGVuZ3RoID0gTWF0aC5taW4ob2xkQ2hpbGRyZW4ubGVuZ3RoLCBuZXdDaGlsZHJlbi5sZW5ndGgpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaW5MZW5ndGg7IGkrKykge1xuICAgICAgICBwYXRjaChvbGRDaGlsZHJlbltpXSwgbmV3Q2hpbGRyZW5baV0pOyAvLyByZWN1cnNpb24gaGVyZVxuICAgICAgfVxuICAgICAgaWYgKG9sZENoaWxkcmVuLmxlbmd0aCA9PT0gbWluTGVuZ3RoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBtaW5MZW5ndGg7IGkgPCBuZXdDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG1vdW50KG5ld0NoaWxkcmVuW2ldLCBlbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBtaW5MZW5ndGg7IGkgPCBvbGRDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGVsLnJlbW92ZUNoaWxkKG9sZENoaWxkcmVuW2ldLmVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBkbyBub3RoaW5nIG5vd1xuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgaCwgbW91bnQsIHBhdGNoIH0gZnJvbSBcIi4vcnVudGltZS1jb3JlXCI7XG5cbmNvbnN0IHZkb20xID0gaChcImRpdlwiLCB7IGNsYXNzOiBcInJlZFwiIH0sIFtoKFwic3BhblwiLCBudWxsLCBcImhlbGxvXCIpXSk7XG5tb3VudCh2ZG9tMSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIikpO1xuY29uc3QgdmRvbTIgPSBoKFwiZGl2XCIsIHsgY2xhc3M6IFwicmVkXCIgfSwgW2goXCJzcGFuXCIsIG51bGwsIFwiaGVsbG9cIildKTtcbnBhdGNoKHZkb20xLCB2ZG9tMik7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=