import { it, describe } from "mocha";
import { createHTMLRenderer } from "../src/runtime-core";
import { dom } from "./init-test-runtime";

const assert = require("chai").assert;

describe("runtime-core-test", () => {
  it("basic", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createHTMLRenderer();
    const vnode = {
      type: "h1",
      props: {
        id: "good",
      },
      children: "hello",
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("h1");
    assert.deepEqual(child.getAttribute("id"), "good");
    assert.deepEqual(child.textContent, "hello");
  });

  it("patch", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createHTMLRenderer();
    const prev = {
      type: "h1",
      props: {
        id: "good",
      },
      children: "hello",
    };
    const next = {
      type: "h1",
      props: {
        id: "bad",
      },
      children: "hello",
    };
    renderer.render(prev, app);
    const child = dom.window.document.querySelector("h1");
    assert.deepEqual(child.getAttribute("id"), "good");
    renderer.patch(prev, next, app);
    assert.deepEqual(child.getAttribute("id"), "bad");
  });

  it("button-disabled-true", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createHTMLRenderer();
    const vnode = {
      type: "button",
      props: {
        disabled: "",
      },
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("button");
    assert.deepEqual(child.getAttributeNames(), ["disabled"]);
  });

  it("button-disabled-false", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createHTMLRenderer();
    const vnode = {
      type: "button",
      props: {
        disabled: false,
      },
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("button");
    assert.deepEqual(child.getAttributeNames(), []);
  });
});
