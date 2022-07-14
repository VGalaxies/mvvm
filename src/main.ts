import { createHTMLRenderer, createRenderer } from "./runtime-core";

const renderer = createHTMLRenderer();
const container = document.getElementById("app");

renderer.render(
  {
    type: "button",
    props: {
      disabled: false,
      onClick: () => alert("clicked"),
    },
  },
  container
);
