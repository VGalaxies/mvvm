import { HTMLVirtualNode } from "./runtime-core";
import { PropertyMap } from "./common";

export interface ComponentOptions {
  name: string;
  render: () => HTMLVirtualNode;
  data?: () => PropertyMap;
}
