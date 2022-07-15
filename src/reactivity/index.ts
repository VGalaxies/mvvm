import { PropertyMap } from "../type/global";
import { track, trigger } from "./effect";
import { ITERATE_KEY, TriggerType } from "./type";

export function reactive(target: PropertyMap): PropertyMap {
  return createReactive(target);
}

export function shallowReactive(target: PropertyMap): PropertyMap {
  return createReactive(target, true);
}

export function readonly(target: PropertyMap): PropertyMap {
  return createReactive(target, false, true);
}

export function shallowReadonly(target: PropertyMap): PropertyMap {
  return createReactive(target, true, true);
}

function createReactive(
  target: PropertyMap,
  isShallow: boolean = false,
  isReadOnly: boolean = false
): PropertyMap {
  const handlers = {
    get(target: PropertyMap, key: PropertyKey, receiver: any): any {
      // reactive(obj).raw = obj
      if (key === "raw") {
        return target;
      }
      if (!isReadOnly) {
        track(target, key);
      }
      const res = Reflect.get(target, key, receiver);
      if (isShallow) {
        // shallow reactive
        return res;
      }
      if (typeof res === "object" && res !== null) {
        return isReadOnly ? readonly(res) : reactive(res); // default -> deep reactive
      }
      return res;
    },
    set(
      target: PropertyMap,
      key: PropertyKey,
      newValue: any,
      receiver: any
    ): boolean {
      if (isReadOnly) {
        console.log(`attr ${String(key)} is read only`);
        return true;
      }
      const oldValue = target[key];
      const type = Object.prototype.hasOwnProperty.call(target, key)
        ? TriggerType.SET
        : TriggerType.ADD;
      const res = Reflect.set(target, key, newValue, receiver);
      if (
        target == receiver.raw && // prototype inheritance
        oldValue !== newValue &&
        (oldValue === oldValue || newValue === newValue) // NaN
      ) {
        trigger(target, key, type);
      }
      return res;
    },
    has(target: PropertyMap, key: PropertyKey): boolean {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target: PropertyMap): (string | symbol)[] {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    deleteProperty(target: PropertyMap, key: PropertyKey): boolean {
      if (isReadOnly) {
        console.log(`attr ${String(key)} is read only`);
        return true;
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (res && hadKey) {
        trigger(target, key, TriggerType.DELETE);
      }
      return res;
    },
  };
  return new Proxy(target, handlers);
}
