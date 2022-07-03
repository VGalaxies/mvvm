import { it, describe } from "mocha";
const assert = require("chai").assert;
const stdout = require("test-console").stdout;

import { emitter } from "../src/publish-subscribe";

describe("publish-subscribe", function () {
  it("on-emit", function () {
    const inspect = stdout.inspect();

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

    emitter.on("article", foo);
    emitter.on("article", bar);
    emitter.emit("article", "hello");

    emitter.on("math", add);
    emitter.on("math", sub);
    emitter.emit("math", 1, 2);
    emitter.emit("math", 300, 120);

    inspect.restore();
    let expected: Array<String> = [
      `foo <- hello\n`,
      `bar <- hello\n`,
      `1 + 2 = 3\n`,
      `1 - 2 = -1\n`,
      `300 + 120 = 420\n`,
      `300 - 120 = 180\n`,
    ];
    assert.deepEqual(inspect.output, expected);
  });
});