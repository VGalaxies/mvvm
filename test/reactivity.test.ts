import { it, describe } from "mocha";

const assert = require("chai").assert;

import { computed, reactive } from "../src/reactivity";

describe("reactivity-test", () => {
  it("basic", () => {
    let product: any = reactive({ price: 5, quantity: 2 });

    let salePrice = computed(() => {
      return product.price * 0.9;
    });

    let total = computed(() => {
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
});
