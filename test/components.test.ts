import { describe, it } from "mocha";
import { JSDOM } from "jsdom";
import { createRenderer } from "../src/render";
import { ComponentOptions } from "../src/render/components";

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
});
