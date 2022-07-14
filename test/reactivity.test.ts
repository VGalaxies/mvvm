import { it, describe } from "mocha";

const assert = require("chai").assert;
const stdout = require("test-console").stdout;

import {
  computed,
  effect,
  proxyRefs,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowReadonly,
  toRefs,
} from "../src/reactivity";

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
    let expected = [`hello\n`, `not\n`];
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
    let expected = [`outer\n`, `inner\n`, `outer\n`, `inner\n`];
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
    let expected = [`hello\n`, `world\n`, `bye\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("reflect-necessity", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({
      foo: "hello",
      get bar() {
        return this.foo;
      },
    });
    effect(() => console.log(data.bar));
    data.foo = "world";

    inspect.restore();
    let expected = [`hello\n`, `world\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("reflect-in-delete", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({
      foo: "hello",
    });
    effect(() => ("foo" in data ? console.log("yes") : console.log("no")));
    data.foo = "world";
    delete data.foo;

    inspect.restore();
    let expected = [`yes\n`, `yes\n`, `no\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("reflect-for-in-delete", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({
      foo: "hello",
    });
    effect(() => {
      for (const key in data) {
        console.log(key);
      }
    });
    data.bar = "good";
    data.foo = "world"; // not trigger effect
    delete data.foo;

    inspect.restore();
    let expected = [`foo\n`, `foo\n`, `bar\n`, `bar\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("no-trigger-when-unchanged", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({
      foo: "foo",
      bar: NaN,
    });
    effect(() => {
      console.log(data.foo);
    });
    effect(() => {
      console.log(String(data.bar));
    });
    data.foo = "foo"; // not trigger effect
    data.bar = NaN; // not trigger effect

    inspect.restore();
    let expected = [`foo\n`, `NaN\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("no-trigger-when-prototype-inheritance", () => {
    const inspect = stdout.inspect();

    const obj = {};
    const proto = { foo: "hello" };
    const child: any = reactive(obj);
    const parent: any = reactive(proto);
    Object.setPrototypeOf(child, parent);

    effect(() => {
      console.log(child.foo);
    });
    child.foo = "world"; // trigger once

    inspect.restore();
    let expected = [`hello\n`, `world\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("shallow-reactive", () => {
    const inspect = stdout.inspect();

    const data: any = reactive({ foo: { bar: "hello" } });
    effect(() => {
      console.log(data.foo.bar);
    });
    data.foo.bar = "world"; // trigger effect

    const shallow: any = shallowReactive({ foo: { bar: "hello" } });
    effect(() => {
      console.log(shallow.foo.bar);
    });
    data.foo.bar = "world"; // not trigger effect
    data.foo = { bar: "world" }; // trigger effect

    inspect.restore();
    let expected = [`hello\n`, `world\n`, `hello\n`, `world\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("readonly", () => {
    const inspect = stdout.inspect();

    const data: any = readonly({ foo: "hello" });
    effect(() => {
      "foo" in data ? console.log("yes") : console.log("no");
    });
    data.foo = "world";
    delete data.foo;

    inspect.restore();
    let expected = [
      `yes\n`,
      `attr foo is read only\n`,
      `attr foo is read only\n`,
    ];
    assert.deepEqual(inspect.output, expected);
  });

  it("shallow-readonly", () => {
    const inspect = stdout.inspect();

    const data: any = readonly({ foo: { bar: "hello" } });
    data.foo.bar = "world";
    delete data.foo.bar;

    const shallow: any = shallowReadonly({ foo: { bar: "hello" } });
    shallow.foo.bar = "world"; // no warning
    delete shallow.foo.bar; // no warning
    shallow.foo = "world";

    inspect.restore();
    let expected = [
      `attr bar is read only\n`,
      `attr bar is read only\n`,
      `attr foo is read only\n`,
    ];
    assert.deepEqual(inspect.output, expected);
  });

  it("ref", () => {
    const inspect = stdout.inspect();

    const refVal: any = ref("hello");
    effect(() => {
      console.log(refVal.value);
    });
    refVal.value = "world";

    inspect.restore();
    let expected = [`hello\n`, `world\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("to-ref", () => {
    const inspect = stdout.inspect();

    const obj: any = reactive({ foo: "hello", bar: "world" });
    const newObj = { ...toRefs(obj) };
    effect(() => {
      console.log(newObj.foo.value, newObj.bar.value);
    });
    obj.foo = "world";
    obj.bar = "hello";

    inspect.restore();
    let expected = [`hello world\n`, `world world\n`, `world hello\n`];
    assert.deepEqual(inspect.output, expected);
  });

  it("proxy-ref", () => {
    const inspect = stdout.inspect();

    const obj: any = reactive({ foo: "hello", bar: "world" });
    const newObj: any = proxyRefs({ ...toRefs(obj) });
    effect(() => {
      console.log(newObj.foo, newObj.bar); // without .value
    });
    obj.foo = "world";
    obj.bar = "hello";

    inspect.restore();
    let expected = [`hello world\n`, `world world\n`, `world hello\n`];
    assert.deepEqual(inspect.output, expected);
  });
});
