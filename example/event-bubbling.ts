import { createRenderer } from "../src/render";
import { effect } from "../src/reactivity/effect";
import { ref } from "../src/reactivity/ref";

const renderer = createRenderer();
const container = document.getElementById("app");

const bol = ref(false);
effect(() => {
  const vnode = {
    type: "div",
    props: bol.value
      ? {
          onClick: () => {
            console.log("clicked");
          },
        }
      : {},
    children: [
      {
        type: "p",
        props: {
          onClick: () => {
            bol.value = true;
          },
        },
        children: "hello",
      },
    ],
  };
  renderer.render(vnode, container);
});
