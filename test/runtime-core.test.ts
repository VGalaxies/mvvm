import { it, describe } from "mocha";
import { createRenderer } from "../src/runtime-core";
import { effect, ref } from "../src/reactivity";
import { JSDOM } from "jsdom";

const assert = require("chai").assert;
const stdout = require("test-console").stdout;

describe("runtime-core-test", () => {
  let dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
  global.document = dom.window.document;

  beforeEach(() => {
    // reset
    dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
  });

  it("simple-render", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
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

  it("patch-props", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const prev = {
      type: "h1",
      props: {
        id: "good",
      },
    };
    const next = {
      type: "h1",
      props: {
        id: "bad",
      },
    };
    renderer.render(prev, app);
    const child = dom.window.document.querySelector("h1");
    assert.deepEqual(child.getAttribute("id"), "good");
    renderer.patch(prev, next, app);
    assert.deepEqual(child.getAttribute("id"), "bad");
  });

  it("patch-children", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const prev = {
      type: "h1",
    };
    const next = {
      type: "h1",
      children: [{ type: "p" }, { type: "p" }],
    };
    renderer.render(prev, app);
    const child = dom.window.document.querySelector("h1");
    assert.deepEqual(child.children.length, 0);
    renderer.patch(prev, next, app);
    assert.deepEqual(child.children.length, 2);
  });

  it("button-disabled-true", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
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
    const renderer = createRenderer();
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

  it("simple-click-event", () => {
    const inspect = stdout.inspect();

    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const vnode = {
      type: "button",
      props: {
        onClick: () => console.log("clicked"),
      },
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("button");
    child.click();

    inspect.restore();
    let expected = [`clicked\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("multiple-click-event", () => {
    const inspect = stdout.inspect();

    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const vnode = {
      type: "button",
      props: {
        onClick: [
          () => console.log("first click"),
          () => console.log("second click"),
        ],
      },
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("button");
    child.click();

    inspect.restore();
    let expected = [`first click\n`, `second click\n`];
    assert.deepEqual(inspect.output, expected);
  });

  // skip due to time inconsistency
  it.skip("event-bubbling", () => {
    const inspect = stdout.inspect();

    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();

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
      renderer.render(vnode, app);
    });
    const node = dom.window.document.querySelector("p");
    node.click();

    inspect.restore();
    let expected: Array<string> = [];
    assert.deepEqual(inspect.output, expected);
  });
});
