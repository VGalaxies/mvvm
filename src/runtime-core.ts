interface HTMLVirtualNode {
  type: string;
  children?: Array<HTMLVirtualNode> | string;
  props?: { [key: string]: any };
  el?: HTMLElementDetail;
}

interface HTMLElementWithVNode extends HTMLElement {
  vnode?: HTMLVirtualNode;
}

interface HTMLElementDetail extends HTMLElement {
  [key: string]: any;

  vei?: { [key: string]: EventInvoker };
}

interface EventInvoker extends EventListener {
  value?: Array<(arg: Event) => any> | ((arg: Event) => any);
  attached?: number;
}

interface HTMLRendererOptions {
  createElement: (arg: string) => HTMLElement;
  insert: (el: HTMLElement, parent: HTMLElement, anchor?: Node) => void;
  setElementText: (el: HTMLElement, text: string) => void;
  patchProps: (
    el: HTMLElementDetail,
    key: string,
    prevValue: any,
    nextValue: any
  ) => void;
}

export function createHTMLRenderer() {
  return createRenderer({
    createElement(tag) {
      return document.createElement(tag);
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    insert(el, parent, anchor) {
      parent.insertBefore(el, anchor);
    },
    patchProps(el, key, prevValue, nextValue) {
      if (/^on/.test(key)) {
        const invokers = el.vei || (el.vei = {});
        let invoker = invokers[key];
        const name = key.slice(2).toLowerCase() as keyof HTMLElementEventMap;
        if (nextValue) {
          if (!invoker) {
            invoker = el.vei[key] = (e) => {
              if (e.timeStamp < invoker.attached) {
                return;
              }
              if (Array.isArray(invoker.value)) {
                // multiple handlers
                invoker.value.forEach((fn) => fn(e));
              } else {
                invoker.value(e);
              }
            };
            invoker.value = nextValue;
            invoker.attached = performance.now();
            el.addEventListener(name, invoker);
          } else {
            // for efficiency
            // avoid removeEventListener when updating
            invoker.value = nextValue;
          }
        } else if (invoker) {
          el.removeEventListener(name, invoker);
        }
      } else if (key === "class") {
        // for efficiency
        // since `"class" in el` is false, and `setAttribute` is slower
        el.className = nextValue || "";
      } else {
        if (key in el) {
          // set DOM properties first
          const type = typeof el[key];
          // handle button disabled
          if (type === "boolean" && nextValue === "") {
            el[key] = true;
          } else {
            el[key] = nextValue;
          }
        } else {
          el.setAttribute(key, nextValue);
        }
      }
    },
  });
}

export function createRenderer(options: HTMLRendererOptions) {
  const { createElement, insert, setElementText, patchProps } = options;

  function patch(
    n1: HTMLVirtualNode,
    n2: HTMLVirtualNode,
    container: HTMLElementWithVNode
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

  function patchChildren(
    n1: HTMLVirtualNode,
    n2: HTMLVirtualNode,
    container: HTMLElementDetail
  ) {
    if (typeof n2.children === "string") {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c));
      }
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // TODO -> fast diff
        n1.children.forEach((c) => unmount(c));
        n2.children.forEach((c) => patch(null, c, container));
      } else {
        setElementText(container, "");
        n2.children.forEach((c) => patch(null, c, container));
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c));
      } else if (typeof n1.children === "string") {
        setElementText(container, "");
      }
    }
  }

  function patchElement(n1: HTMLVirtualNode, n2: HTMLVirtualNode) {
    const el = (n2.el = n1.el);

    // props
    const oldProps = n1.props;
    const newProps = n2.props;
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }

    // children
    patchChildren(n1, n2, el);
  }

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

  function mountElement(
    vnode: HTMLVirtualNode,
    container: HTMLElementWithVNode
  ) {
    const el = (vnode.el = createElement(vnode.type));

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

  return {
    render,
    patch,
  };
}
