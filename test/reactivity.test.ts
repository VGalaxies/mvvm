import { it, describe } from "mocha";

const assert = require("chai").assert;
const stdout = require("test-console").stdout;

import { computed, effect, reactive } from "../src/reactivity";

describe("reactivity-test", () => {
  it("computed", () => {
    const product: any = reactive({ price: 5, quantity: 2 });

    const salePrice = computed(() => {
      return product.price * 0.9;
    });

    const total = computed(() => {
      return salePrice.value * product.quantity;
    });

    assert.deepEqual(salePrice.value, 4.5);
    assert.deepEqual(total.value, 9);

    product.quantity = 3;
    assert.deepEqual(salePrice.value, 4.5);
    assert.deepEqual(total.value, 13.5);

    product.price = 10;
    assert.deepEqual(salePrice.value, 9);
    assert.deepEqual(total.value, 27);
  });

  it("cleanup", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({ ok: true, text: "hello" });
    effect(() => {
      console.log(data.ok ? data.text : "not");
    });

    data.ok = false;
    data.text = "world"; // should not log "not"

    inspect.restore();
    let expected: Array<String> = [`hello\n`, `not\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("nested-effect", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({ foo: true, bar: true });
    let foo: any, bar: any;

    effect(() => {
      console.log("outer");
      effect(() => {
        console.log("inner");
        bar = data.bar;
      });
      foo = data.foo;
    });

    data.foo = false;

    inspect.restore();
    let expected: Array<String> = [`outer\n`, `inner\n`, `outer\n`, `inner\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("get-then-set", () => {
    const data: any = reactive({ foo: 0 });

    effect(() => {
      data.foo = data.foo + 1;
    });

    assert.deepEqual(data.foo, 1);
  });

  it("scheduler", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({ text: "hello" });

    effect(
      () => {
        console.log(data.text);
      },
      {
        scheduler(fn) {
          fn();
          console.log("bye");
        },
      }
    );

    data.text = "world";

    inspect.restore();
    let expected: Array<String> = [`hello\n`, `world\n`, `bye\n`];
    assert.deepEqual(inspect.output, expected);
  });
});
