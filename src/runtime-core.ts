interface HTMLVirtualNode {
  type: string;
  children?: Array<HTMLVirtualNode> | string;
  props?: object;
  el?: HTMLElementWithVEL;
}

interface HTMLElementWithVNode extends HTMLElement {
  vnode?: HTMLVirtualNode;
}

interface HTMLElementWithVEL extends HTMLElement {
  vei?: object;
}

interface HTMLRendererOptions {
  createElement: (arg: string) => HTMLElement;
  insert: (el: HTMLElement, parent: HTMLElement, anchor?: Node) => void;
  setElementText: (el: HTMLElement, text: string) => void;
  patchProps: (
    el: HTMLElementWithVEL,
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
        let invoker: any = invokers[key as keyof typeof invokers];
        const name = key.slice(2).toLowerCase();
        if (nextValue) {
          if (!invoker) {
            // @ts-ignore
            invoker = el.vei[key] = (e) => {
              invoker.value(e);
            };
            invoker.value = nextValue;
            el.addEventListener(name, invoker);
          } else {
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
          const type = typeof el[key as keyof typeof el];
          // handle button disabled
          if (type === "boolean" && nextValue === "") {
            // @ts-ignore
            el[key] = true;
          } else {
            // @ts-ignore
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
        patchProps(el, key, null, vnode.props[key as keyof typeof vnode.props]);
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
