import { createRenderer } from "../src/render";
import { ComponentOptions } from "../src/render/components";

const app = document.getElementById("app");
const renderer = createRenderer();
const input: ComponentOptions = {
  name: "demo",
  data() {
    return {
      text: "",
    };
  },
  render() {
    return {
      type: "div",
      props: {
        id: "target",
      },
      children: [
        {
          type: "input",
          props: {
            onChange: (e: any) => {
              this.text = e.target.value;
            },
          },
        },
        {
          type: "p",
          props: {
            id: "log",
          },
          children: `${this.text}`,
        },
      ],
    };
  },
};

renderer.render({ type: input }, app);
