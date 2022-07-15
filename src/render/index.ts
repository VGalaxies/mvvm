import { HTMLElementWithVNode, HTMLVirtualNode } from "./type";
import { patch } from "./patch";
import { unmount } from "./mount";

export function createRenderer() {
  function render(vnode: HTMLVirtualNode, container: HTMLElementWithVNode) {
    if (vnode) {
      patch(container.vnode, vnode, container);
    } else {
      if (container.vnode) {
        unmount(container.vnode);
      }
    }
    container.vnode = vnode;
  }

  return {
    render,
    patch,
  };
}
