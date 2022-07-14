import { createHTMLRenderer } from "./runtime-core";
import { effect, ref } from "./reactivity";

const renderer = createHTMLRenderer();
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
