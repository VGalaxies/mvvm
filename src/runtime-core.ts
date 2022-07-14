interface HTMLVirtualNode {
  type: string;
  children?: Array<HTMLVirtualNode> | string;
  props?: object;
  el?: HTMLElement;
}

interface HTMLElementWithNode extends HTMLElement {
  vnode?: HTMLVirtualNode;
}

interface HTMLRendererOptions {
  createElement: (arg: string) => HTMLElement;
  insert: (el: HTMLElement, parent: HTMLElement, anchor?: Node) => void;
  setElementText: (el: HTMLElement, text: string) => void;
  patchProps: (
    el: HTMLElement,
    key: string,
    prevValue: any,
    nextValue: any
  ) => void;
}

export function createRenderer(options: HTMLRendererOptions) {
  const { createElement, insert, setElementText, patchProps } = options;

  function patch(
    n1: HTMLVirtualNode,
    n2: HTMLVirtualNode,
    container: HTMLElementWithNode
  ) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === "string") {
      // tag
      if (!n1) {
        mountElement(n2, container);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === "object") {
      // TODO -> component
    }
  }

  function unmount(vnode: HTMLVirtualNode) {
    const el = vnode.el;
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  }

  function patchElement(n1: HTMLVirtualNode, n2: HTMLVirtualNode) {
    const el = (n2.el = n1.el);

    // props
    const oldProps = n1.props;
    const newProps = n2.props;
    for (const key in newProps) {
      if (
        newProps[key as keyof typeof newProps] !==
        oldProps[key as keyof typeof oldProps]
      ) {
        patchProps(
          el,
          key,
          oldProps[key as keyof typeof oldProps],
          newProps[key as keyof typeof newProps]
        );
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key as keyof typeof oldProps], null);
      }
    }

    // TODO -> children
  }

  function render(vnode: HTMLVirtualNode, container: HTMLElementWithNode) {
    if (vnode) {
      patch(container.vnode, vnode, container);
    } else {
      if (container.vnode) {
        unmount(container.vnode);
      }
    }
    container.vnode = vnode;
  }

  function mountElement(
    vnode: HTMLVirtualNode,
    container: HTMLElementWithNode
  ) {
    const el = (vnode.el = createElement(vnode.type));

    // props
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key as keyof typeof vnode.props]);
      }
    }

    // children
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
      el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el);
      });
    }

    insert(el, container);
  }

  return {
    render,
    patch,
  };
}
