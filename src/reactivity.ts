import { PropertyMap } from "./common";

type AnySupplier = () => any;

interface EffectFn extends AnySupplier {
  deps: Array<Set<EffectFn>>; // for clean up
  options?: EffectOptions;
}

type EffectFnConsumer = (arg?: EffectFn) => void;

interface EffectOptions {
  scheduler?: EffectFnConsumer;
  lazy?: boolean;
}

let activeEffect: EffectFn = null;
const effectStack: Array<EffectFn> = []; // for nested effects

const targetMap = new WeakMap<PropertyMap, Map<PropertyKey, Set<EffectFn>>>();
const ITERATE_KEY = Symbol();

enum TriggerType {
  SET = "SET",
  ADD = "ADD",
  DELETE = "DELETE",
}

function track(target: PropertyMap, key: PropertyKey) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map<PropertyKey, Set<EffectFn>>()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set<EffectFn>()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target: PropertyMap, key: PropertyKey, type?: TriggerType) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effects = depsMap.get(key);

  const effectsToRun = new Set<EffectFn>();
  effects &&
    effects.forEach((effectFn) => {
      // get-and-set
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });

  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    // for ... in
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach((effectFn) => {
        // get-and-set
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  effectsToRun.forEach((effectFn) => {
    // intro scheduler
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

export function reactive(target: PropertyMap) {
  return createReactive(target);
}

export function shallowReactive(target: PropertyMap) {
  return createReactive(target, true);
}

export function readonly(target: PropertyMap) {
  return createReactive(target, false, true);
}

export function shallowReadonly(target: PropertyMap) {
  return createReactive(target, true, true);
}

function createReactive(
  target: PropertyMap,
  isShallow: boolean = false,
  isReadOnly: boolean = false
) {
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
    set(target: PropertyMap, key: PropertyKey, newValue: any, receiver: any) {
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
    has(target: PropertyMap, key: PropertyKey) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target: PropertyMap) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    deleteProperty(target: PropertyMap, key: PropertyKey) {
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

function cleanup(effectFn: EffectFn) {
  for (let i = 0; i < effectFn.deps.length; ++i) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

export function effect(fn: AnySupplier, options: EffectOptions = {}): EffectFn {
  const effectFn: EffectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

export function computed(getter: AnySupplier) {
  let value: any;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, "value");
    },
  });
  const obj = {
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
