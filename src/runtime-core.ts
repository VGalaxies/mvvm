export interface VNode {
  tag: string;
  props: any;
  children: string | Array<VNode>;
  el?: HTMLElement;
}

export function h(
  tag: string,
  props: any,
  children: string | Array<VNode>
): VNode {
  return {
    tag,
    props,
    children,
  };
}

export function mount(vnode: VNode, container: HTMLElement) {
  const { tag, props, children } = vnode;
  const el = (vnode.el = document.createElement(tag));

  // props
  if (props) {
    for (let key in props) {
      const value = props[key];
      if (/^on/.test(key)) {
        // convention
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // children
  if (children) {
    if (typeof children === "string") {
      el.append(children);
    } else {
      children.forEach((child) => {
        mount(child, el);
      });
    }
  }

  container.append(el);
}

export function patch(n1: VNode, n2: VNode) {
  if (n1.tag === n2.tag) {
    const el = (n2.el = n1.el);

    // props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    for (let key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        el.setAttribute(key, newValue);
      }
    }

    for (let key in oldProps) {
      if (!(key in newProps)) {
        el.removeAttribute(key);
      }
    }

    // children
    const oldChildren = n1.children;
    const newChildren = n2.children;

    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        if (oldChildren !== newChildren) {
          // for efficiency
          el.innerHTML = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
    } else if (typeof oldChildren === "string" && Array.isArray(newChildren)) {
      el.innerHTML = "";
      newChildren.forEach((child) => mount(child, el));
    } else if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
      const minLength = Math.min(oldChildren.length, newChildren.length);
      for (let i = 0; i < minLength; i++) {
        patch(oldChildren[i], newChildren[i]); // recursion here
      }
      if (newChildren.length > oldChildren.length) {
        newChildren.slice(oldChildren.length).forEach((child) => {
          mount(child, el);
        });
      } else if (oldChildren.length > newChildren.length) {
        oldChildren.slice(newChildren.length).forEach((child) => {
          el.removeChild(child.el);
        });
      }
    }
  } else {
    // do nothing now
  }
}
