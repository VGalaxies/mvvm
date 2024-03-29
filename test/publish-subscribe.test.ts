import { describe, it } from "mocha";
import { EventEmitter } from "../src/utils/publish-subscribe";

const assert = require("chai").assert;
const stdout = require("test-console").stdout;

describe("publish-subscribe-test", () => {
  function foo(content: string) {
    console.log(`foo <- ${content}`);
  }

  function bar(content: string) {
    console.log(`bar <- ${content}`);
  }

  function add(x: number, y: number) {
    console.log(`${x} + ${y} = ${x + y}`);
  }

  function sub(x: number, y: number) {
    console.log(`${x} - ${y} = ${x - y}`);
  }

  it("on-emit", () => {
    const emitter = new EventEmitter();
    const inspect = stdout.inspect();

    emitter.on("article", foo);
    emitter.on("article", bar);
    emitter.emit("article", "hello");

    emitter.on("math", add);
    emitter.on("math", sub);
    emitter.emit("math", 1, 2);
    emitter.emit("math", 300, 120);

    inspect.restore();

    let expected = [
      `foo <- hello\n`,
      `bar <- hello\n`,
      `1 + 2 = 3\n`,
      `1 - 2 = -1\n`,
      `300 + 120 = 420\n`,
      `300 - 120 = 180\n`,
    ];
    assert.deepEqual(inspect.output, expected);
  });

  it("on-off-emit", () => {
    const emitter = new EventEmitter();
    const inspect = stdout.inspect();

    emitter.on("article", foo);
    emitter.on("article", bar);
    emitter.off("article", foo);
    emitter.emit("article", "hello");

    inspect.restore();

    let expected = [`bar <- hello\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("on-once-emit", () => {
    const emitter = new EventEmitter();
    const inspect = stdout.inspect();

    emitter.on("article", foo);
    emitter.once("article", bar);
    emitter.off("article", foo);
    emitter.emit("article", "hello");
    emitter.emit("article", "hello");

    inspect.restore();

    let expected = [`bar <- hello\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("once-off-emit", () => {
    const emitter = new EventEmitter();
    const inspect = stdout.inspect();

    emitter.once("article", bar);
    emitter.off("article", bar);
    emitter.emit("article", "hello");

    inspect.restore();

    let expected: Array<string> = [];
    assert.deepEqual(inspect.output, expected);
  });
});
