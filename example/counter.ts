import { createRenderer } from "../src/render";
import { ComponentOptions } from "../src/render/components";

const app = document.getElementById("app");
const renderer = createRenderer();
const counter: ComponentOptions = {
  name: "demo",
  data() {
    return {
      count: 0,
    };
  },
  render() {
    return {
      type: "button",
      props: {
        onClick: () => {
          this.count++;
          console.log(`${this.count}`);
        },
      },
      children: `${this.count}`,
    };
  },
};

renderer.render({ type: counter }, app);
