import { PropertyMap } from "../type/global";
import { reactive } from "./index";

export function ref(val: any) {
  const wrapper = {
    value: val,
  };
  Object.defineProperty(wrapper, "__v_isRef", {
    value: true,
  });
  return reactive(wrapper);
}

export function toRef(target: PropertyMap, key: PropertyKey) {
  const wrapper = {
    get value() {
      return target[key];
    },
    set value(val) {
      target[key] = val;
    },
  };
  Object.defineProperty(wrapper, "__v_isRef", {
    value: true,
  });
  return wrapper;
}

export function toRefs(target: PropertyMap) {
  const ret: PropertyMap = {};
  for (const key in target) {
    ret[key] = toRef(target, key);
  }
  return ret;
}

export function proxyRefs(target: PropertyMap) {
  const handlers = {
    get(target: PropertyMap, key: PropertyKey, receiver: any) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set(target: PropertyMap, key: PropertyKey, newValue: any, receiver: any) {
      const value: any = target[key];
      if (value.__v_isRef) {
        value.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    },
  };
  return new Proxy(target, handlers);
}
