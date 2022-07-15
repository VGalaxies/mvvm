import { ComponentInstance, ComponentOptions } from "./components";
import { PropertyMap } from "../type/global";

export interface HTMLVirtualNode {
  type: string | ComponentOptions;
  children?: Array<HTMLVirtualNode> | string;
  props?: PropertyMap;
  el?: HTMLElementDetail;
  component?: ComponentInstance;
}

export interface HTMLElementWithVNode extends HTMLElement {
  vnode?: HTMLVirtualNode;
}

export interface HTMLElementDetail extends HTMLElement {
  [key: string]: any;

  vei?: { [key: string]: EventInvoker };
}

interface EventInvoker extends EventListener {
  value?: Array<(arg: Event) => any> | ((arg: Event) => any);
  attached?: number;
}
