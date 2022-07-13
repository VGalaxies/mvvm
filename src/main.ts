import { h, mount, patch } from "./runtime-core";

const vdom1 = h("div", { class: "red" }, [h("span", null, "hello")]);
mount(vdom1, document.getElementById("app"));
const vdom2 = h("div", { class: "green" }, [h("span", null, "world")]);
patch(vdom1, vdom2);
