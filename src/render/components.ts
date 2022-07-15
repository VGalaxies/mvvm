import { HTMLElementWithVNode, HTMLVirtualNode } from "./type";
import { PropertyMap } from "../type/global";
import { effect } from "../reactivity/effect";
import { patch } from "./patch";
import { reactive } from "../reactivity";

export interface ComponentOptions {
  name: string;
  render: () => HTMLVirtualNode;
  data?: () => PropertyMap;
}

export function mountComponent(
  vnode: HTMLVirtualNode,
  container: HTMLElementWithVNode,
  anchor?: Node
) {
  const componentOptions = vnode.type as ComponentOptions;
  const { render, data } = componentOptions;

  const state = reactive(data ? data() : {});

  effect(() => {
    const subTree = render.call(state, state);
    patch(null, subTree, container, anchor);
  });
}
