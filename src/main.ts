import { createRenderer } from "./render";
import { effect } from "./reactivity/effect";
import { ref } from "./reactivity/ref";

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
