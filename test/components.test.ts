import {describe, it} from "mocha";
import {JSDOM} from "jsdom";
import {createRenderer} from "../src/render";
import {ComponentOptions} from "../src/render/components";
import {HTMLVirtualNode} from "../src/render/type";

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
    renderer.render({type: component}, app);
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
          children: `\`this.foo\` is ${this.foo}`,
        };
      },
    };
    const vnode: HTMLVirtualNode = {type: component};
    renderer.render(vnode, app);
    const child = dom.window.document.querySelector("div");
    assert.deepEqual(child.textContent, "`this.foo` is hello");
    vnode.component.state.foo = "world"; // reactive
    assert.deepEqual(child.textContent, "`this.foo` is world");
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
          children: `\`this.foo\` is ${this.foo}`,
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
    assert.deepEqual(child.textContent, "`this.foo` is hello");
    vnode.component.props.foo = "world"; // reactive
    assert.deepEqual(child.textContent, "`this.foo` is world");
  });

  it("patch", () => {
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
          children: `\`this.foo\` is ${this.foo}`,
        };
      },
    };
    const prev: HTMLVirtualNode = {
      type: component,
      props: {
        foo: "hello",
      },
    };
    renderer.render(prev, app);
    const child = dom.window.document.querySelector("div");
    assert.deepEqual(child.textContent, "`this.foo` is hello");

    const next: HTMLVirtualNode = {
      type: component,
      props: {
        foo: "world",
      },
    };
    renderer.render(next, app);
    assert.deepEqual(child.textContent, "`this.foo` is world");
  })

  it("hook-create", () => {
    const inspect = stdout.inspect();

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
        };
      },
      beforeCreate() {
        console.log(`\`this\` is ${this}`);
      },
      created() {
        console.log(`\`this.foo\` is ${this.foo}`);
      },
    };
    renderer.render({type: component}, app);

    inspect.restore();
    let expected = ["`this` is undefined\n", "`this.foo` is hello\n"];
    assert.deepEqual(inspect.output, expected);
  });

  it("hook-mount-update", () => {
    const inspect = stdout.inspect();

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
          children: `${this.foo}`,
        };
      },
      beforeMount() {
        console.log(`\`this.foo\` is ${this.foo}`);
      },
      mounted() {
        console.log(`\`this.foo\` is ${this.foo}`);
      },
      beforeUpdate() {
        console.log(`\`this.foo\` is ${this.foo}`);
      },
      updated() {
        console.log(`\`this.foo\` is ${this.foo}`);
      },
    };
    const vnode: HTMLVirtualNode = {type: component};
    renderer.render(vnode, app);
    vnode.component.state.foo = "world"; // reactive

    inspect.restore();
    let expected = [
      "`this.foo` is hello\n",
      "`this.foo` is hello\n",
      "`this.foo` is world\n",
      "`this.foo` is world\n",
    ];
    assert.deepEqual(inspect.output, expected);
  });
});
