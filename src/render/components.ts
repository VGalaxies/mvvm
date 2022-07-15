import { HTMLElementWithVNode, HTMLVirtualNode } from "./type";
import { PropertyMap, VoidSupplier } from "../type/global";
import { effect } from "../reactivity/effect";
import { patch } from "./patch";
import { reactive, shallowReactive } from "../reactivity";

export interface ComponentOptions {
  name: string;
  render: () => HTMLVirtualNode;
  data?: () => PropertyMap;
  props?: PropertyMap;

  // hooks
  beforeCreate?: VoidSupplier;
  created?: VoidSupplier;
  beforeMount?: VoidSupplier;
  mounted?: VoidSupplier;
  beforeUpdate?: VoidSupplier;
  updated?: VoidSupplier;
}

export interface ComponentInstance {
  state: PropertyMap; // deep reactive
  props: PropertyMap; // shallow reactive
  isMounted: boolean;
  subTree: HTMLVirtualNode;
}

function resolveProps(options: PropertyMap, propsData: PropertyMap) {
  const props: PropertyMap = {};
  const attrs: PropertyMap = {};
  for (const key in propsData) {
    if (key in options) {
      // defined in ComponentOptions.props
      props[key] = propsData[key];
    } else {
      // not defined in ComponentOptions.props
      attrs[key] = propsData[key];
    }
  }
  return [props, attrs];
}

function hasPropsChanged(
  prevProps: PropertyMap,
  nextProps: PropertyMap
): boolean {
  const nextKeys = Object.keys(nextProps);
  const prevKeys = Object.keys(prevProps);
  if (nextKeys.length !== prevKeys.length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; ++i) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}

export function patchComponent(
  n1: HTMLVirtualNode,
  n2: HTMLVirtualNode,
  anchor?: Node
) {
  const instance = (n2.component = n1.component);
  const { props } = instance; // shallow reactive
  if (hasPropsChanged(n1.props, n2.props)) {
    const [nextProps] = resolveProps(
      (n2.type as ComponentOptions).props,
      n2.props
    );
    for (const key in nextProps) {
      props[key] = nextProps[key];
    }
    for (const key in props) {
      if (!(key in nextProps)) {
        delete props[key];
      }
    }
  }
}

export function mountComponent(
  vnode: HTMLVirtualNode,
  container: HTMLElementWithVNode,
  anchor?: Node
) {
  const componentOptions = vnode.type as ComponentOptions;
  const {
    render,
    data,
    props: propsOption,
    beforeCreate,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
  } = componentOptions;

  beforeCreate && beforeCreate();

  const instance: ComponentInstance = {
    state: {},
    props: {},
    isMounted: false,
    subTree: null,
  };
  const [props, attrs] = resolveProps(propsOption, vnode.props);
  instance.props = shallowReactive(props);
  const state = (instance.state = reactive(data ? data() : {}));

  vnode.component = instance;

  const renderContext = new Proxy(instance, {
    get(target: PropertyMap, key: PropertyKey, receiver: any): any {
      const { state, props } = target;
      if (state && key in state) {
        return state[key];
      } else if (key in props) {
        return props[key];
      } else {
        console.log(`${String(key)} not existed`);
      }
    },
    set(
      target: PropertyMap,
      key: PropertyKey,
      value: any,
      receiver: any
    ): boolean {
      const { state, props } = target;
      if (state && key in state) {
        state[key] = value;
        return true;
      } else if (key in props) {
        console.warn(
          `attempt to mutate prop ${String(key)}, props are readonly`
        );
        return false;
      } else {
        console.log(`${String(key)} not existed`);
        return false;
      }
    },
  });

  created && created.call(renderContext);

  effect(
    () => {
      const subTree = render.call(renderContext);
      if (!instance.isMounted) {
        beforeMount && beforeMount.call(renderContext);
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        mounted && mounted.call(renderContext);
      } else {
        beforeUpdate && beforeUpdate.call(renderContext);
        patch(instance.subTree, subTree, container, anchor);
        updated && updated.call(renderContext);
      }
      instance.subTree = subTree;
    }
    // {
    //   scheduler: queueJob,
    // }
  );
}
