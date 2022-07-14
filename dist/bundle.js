/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/runtime-core.ts":
/*!*****************************!*\
  !*** ./src/runtime-core.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRenderer = void 0;
function createRenderer(options) {
    var createElement = options.createElement, setElementText = options.setElementText, insert = options.insert;
    function patch(n1, n2, container) {
        if (!n1) {
            mountElement(n2, container);
        }
    }
    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container);
        }
        else {
            if (container._vnode) {
                container.innerHTML = "";
            }
        }
        container._vnode = vnode;
    }
    function mountElement(vnode, container) {
        var el = createElement(vnode.type);
        if (typeof vnode.children === "string") {
            setElementText(el, vnode.children);
        }
        insert(el, container);
    }
    return {
        render: render,
    };
}
exports.createRenderer = createRenderer;


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
var renderer = (0, runtime_core_1.createRenderer)({
    createElement: function (tag) {
        return document.createElement(tag);
    },
    setElementText: function (el, text) {
        el.textContent = text;
    },
    insert: function (el, parent, anchor) {
        parent.insertBefore(el, anchor);
    },
});
renderer.render({
    type: "h1",
    children: "hello",
}, document.getElementById("app"));

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkEsU0FBZ0IsY0FBYyxDQUFDLE9BQXdCO0lBQzdDLGlCQUFhLEdBQTZCLE9BQU8sY0FBcEMsRUFBRSxjQUFjLEdBQWEsT0FBTyxlQUFwQixFQUFFLE1BQU0sR0FBSyxPQUFPLE9BQVosQ0FBYTtJQUUxRCxTQUFTLEtBQUssQ0FDWixFQUFlLEVBQ2YsRUFBZSxFQUNmLFNBQThCO1FBRTlCLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDUCxZQUFZLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzdCO0lBQ0gsQ0FBQztJQUVELFNBQVMsTUFBTSxDQUFDLEtBQWtCLEVBQUUsU0FBOEI7UUFDaEUsSUFBSSxLQUFLLEVBQUU7WUFDVCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDMUI7U0FDRjtRQUNELFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFrQixFQUFFLFNBQThCO1FBQ3RFLElBQU0sRUFBRSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxPQUFPLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ3RDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU07S0FDUCxDQUFDO0FBQ0osQ0FBQztBQW5DRCx3Q0FtQ0M7Ozs7Ozs7VUN0REQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7O0FDdEJBLHdGQUFnRDtBQUVoRCxJQUFNLFFBQVEsR0FBRyxpQ0FBYyxFQUFDO0lBQzlCLGFBQWEsWUFBQyxHQUFHO1FBQ2YsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxjQUFjLFlBQUMsRUFBRSxFQUFFLElBQUk7UUFDckIsRUFBRSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUNELE1BQU0sWUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU07UUFDdkIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNGLENBQUMsQ0FBQztBQUNILFFBQVEsQ0FBQyxNQUFNLENBQ2I7SUFDRSxJQUFJLEVBQUUsSUFBSTtJQUNWLFFBQVEsRUFBRSxPQUFPO0NBQ2xCLEVBQ0QsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FDL0IsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL212dm0vLi9zcmMvcnVudGltZS1jb3JlLnRzIiwid2VicGFjazovL212dm0vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXZ2bS8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBWaXJ0dWFsTm9kZSB7XG4gIHR5cGU6IHN0cmluZztcbiAgY2hpbGRyZW46IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEhUTUxFbGVtZW50V2l0aE5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF92bm9kZT86IFZpcnR1YWxOb2RlO1xufVxuXG5pbnRlcmZhY2UgUmVuZGVyZXJPcHRpb25zIHtcbiAgY3JlYXRlRWxlbWVudDogKGFyZzogc3RyaW5nKSA9PiBIVE1MRWxlbWVudFdpdGhOb2RlO1xuICBzZXRFbGVtZW50VGV4dDogKGVsOiBIVE1MRWxlbWVudFdpdGhOb2RlLCB0ZXh0OiBzdHJpbmcpID0+IHZvaWQ7XG4gIGluc2VydDogKFxuICAgIGVsOiBIVE1MRWxlbWVudFdpdGhOb2RlLFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnRXaXRoTm9kZSxcbiAgICBhbmNob3I/OiBOb2RlXG4gICkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyKG9wdGlvbnM6IFJlbmRlcmVyT3B0aW9ucykge1xuICBjb25zdCB7IGNyZWF0ZUVsZW1lbnQsIHNldEVsZW1lbnRUZXh0LCBpbnNlcnQgfSA9IG9wdGlvbnM7XG5cbiAgZnVuY3Rpb24gcGF0Y2goXG4gICAgbjE6IFZpcnR1YWxOb2RlLFxuICAgIG4yOiBWaXJ0dWFsTm9kZSxcbiAgICBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aE5vZGVcbiAgKSB7XG4gICAgaWYgKCFuMSkge1xuICAgICAgbW91bnRFbGVtZW50KG4yLCBjb250YWluZXIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlcih2bm9kZTogVmlydHVhbE5vZGUsIGNvbnRhaW5lcjogSFRNTEVsZW1lbnRXaXRoTm9kZSkge1xuICAgIGlmICh2bm9kZSkge1xuICAgICAgcGF0Y2goY29udGFpbmVyLl92bm9kZSwgdm5vZGUsIGNvbnRhaW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjb250YWluZXIuX3Zub2RlKSB7XG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgfVxuICAgIH1cbiAgICBjb250YWluZXIuX3Zub2RlID0gdm5vZGU7XG4gIH1cblxuICBmdW5jdGlvbiBtb3VudEVsZW1lbnQodm5vZGU6IFZpcnR1YWxOb2RlLCBjb250YWluZXI6IEhUTUxFbGVtZW50V2l0aE5vZGUpIHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQodm5vZGUudHlwZSk7XG4gICAgaWYgKHR5cGVvZiB2bm9kZS5jaGlsZHJlbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc2V0RWxlbWVudFRleHQoZWwsIHZub2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgaW5zZXJ0KGVsLCBjb250YWluZXIpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIsXG4gIH07XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgY3JlYXRlUmVuZGVyZXIgfSBmcm9tIFwiLi9ydW50aW1lLWNvcmVcIjtcblxuY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVSZW5kZXJlcih7XG4gIGNyZWF0ZUVsZW1lbnQodGFnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgfSxcbiAgc2V0RWxlbWVudFRleHQoZWwsIHRleHQpIHtcbiAgICBlbC50ZXh0Q29udGVudCA9IHRleHQ7XG4gIH0sXG4gIGluc2VydChlbCwgcGFyZW50LCBhbmNob3IpIHtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCBhbmNob3IpO1xuICB9LFxufSk7XG5yZW5kZXJlci5yZW5kZXIoXG4gIHtcbiAgICB0eXBlOiBcImgxXCIsXG4gICAgY2hpbGRyZW46IFwiaGVsbG9cIixcbiAgfSxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIilcbik7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=