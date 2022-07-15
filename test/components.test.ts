import { describe, it } from "mocha";
import { JSDOM } from "jsdom";
import { createRenderer } from "../src/render";
import { ComponentOptions } from "../src/render/components";
import { HTMLVirtualNode } from "../src/render/type";

const assert = require("chai").assert;
const stdout = require("test-console").stdout;

describe("components-test", () => {
  let dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
  global.document = dom.window.document;

  beforeEach(() => {
    // reset
    dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
  });

  it("basic", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const component: ComponentOptions = {
      name: "demo",
      render() {
        return {
          type: "h1",
          props: {
            id: "good",
          },
          children: "hello",
        };
      },
    };
    renderer.render({ type: component }, app);
    const child = dom.window.document.querySelector("h1");
    assert.deepEqual(child.getAttribute("id"), "good");
    assert.deepEqual(child.textContent, "hello");
  });

  // NOTE -> disabled mountComponent scheduler
  it("data-state-reactive", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const component: ComponentOptions = {
      name: "demo",
      data() {
        return {
          foo: "hello",
        };
      },
      render() {
        return {
          type: "div",
          children: `foo is ${this.foo}`,
        };
      },
    };
    const vnode: HTMLVirtualNode = { type: component };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("div");
    assert.deepEqual(child.textContent, "foo is hello");
    vnode.component.state.foo = "world"; // reactive
    assert.deepEqual(child.textContent, "foo is world");
  });

  // NOTE -> disabled mountComponent scheduler
  it("props-reactive", () => {
    const app = dom.window.document.getElementById("app");
    const renderer = createRenderer();
    const component: ComponentOptions = {
      name: "demo",
      props: {
        foo: "",
      },
      render() {
        return {
          type: "div",
          children: `foo is ${this.foo}`,
        };
      },
    };
    const vnode: HTMLVirtualNode = {
      type: component,
      props: {
        foo: "hello",
      },
    };
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("div");
    assert.deepEqual(child.textContent, "foo is hello");
    vnode.component.props.foo = "world"; // reactive
    assert.deepEqual(child.textContent, "foo is world");
  });
});
