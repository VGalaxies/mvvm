import { createRenderer } from "../src/render";
import { effect } from "../src/reactivity/effect";

const renderer = createRenderer();
const container = document.getElementById("app");

effect(() => {
  const vnode = {
    type: "h1",
    children: "hello",
  };
  renderer.render(vnode, container);
});
