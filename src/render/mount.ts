import { HTMLElementWithVNode, HTMLVirtualNode } from "./type";
import { createElement, insert, setElementText } from "./common";
import { patch, patchProps } from "./patch";

export function mountElement(
  vnode: HTMLVirtualNode,
  container: HTMLElementWithVNode
) {
  const el = (vnode.el = createElement(vnode.type as string));

  // props
  if (vnode.props) {
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key]);
    }
  }

  // children
  if (typeof vnode.children === "string") {
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  insert(el, container);
}

export function unmount(vnode: HTMLVirtualNode) {
  const el = vnode.el;
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}
