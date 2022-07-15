import { AnySupplier, PropertyMap } from "../type/global";
import { effect, track, trigger } from "./effect";

export function computed(getter: AnySupplier): PropertyMap {
  let value: any;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, "value");
    },
  });
  const obj: PropertyMap = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, "value");
      return value;
    },
  };

  return obj;
}
