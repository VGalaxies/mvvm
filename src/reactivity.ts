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

const targetMap = new WeakMap();
const ITERATE_KEY = Symbol();

enum TriggerType {
  SET = "SET",
  ADD = "ADD",
  DELETE = "DELETE",
}

function track(target: object, key: PropertyKey) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target: object, key: PropertyKey, type?: TriggerType) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects &&
    effects.forEach((effectFn: EffectFn) => {
      // get-and-set
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });

  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach((effectFn: EffectFn) => {
        // get-and-set
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  effectsToRun.forEach((effectFn: EffectFn) => {
    // intro scheduler
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

export function reactive(target: object) {
  return createReactive(target);
}

export function shallowReactive(target: object) {
  return createReactive(target, true);
}

export function readonly(target: object) {
  return createReactive(target, false, true);
}

export function shallowReadonly(target: object) {
  return createReactive(target, true, true);
}

function createReactive(
  target: object,
  isShallow: boolean = false,
  isReadOnly: boolean = false
) {
  const handlers = {
    get(target: object, key: PropertyKey, receiver: any): any {
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
    set(target: object, key: PropertyKey, value: any, receiver: any) {
      if (isReadOnly) {
        console.log(`attr ${String(key)} is read only`);
        return true;
      }
      // https://bobbyhadz.com/blog/typescript-no-index-signature-with-parameter-of-type
      const oldValue = target[key as keyof typeof target];
      const type = Object.prototype.hasOwnProperty.call(target, key)
        ? TriggerType.SET
        : TriggerType.ADD;
      const res = Reflect.set(target, key, value, receiver);
      if (
        target == receiver.raw && // prototype inheritance
        oldValue !== value &&
        (oldValue === oldValue || value === value) // NaN
      ) {
        trigger(target, key, type);
      }
      return res;
    },
    has(target: object, key: PropertyKey) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target: object) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    deleteProperty(target: object, key: PropertyKey) {
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

// export function ref(rawVal?: any) {
//   const r = {
//     get value() {
//       track(r, "value");
//       return rawVal;
//     },
//     set value(newVal) {
//       rawVal = newVal;
//       trigger(r, "value");
//     },
//   };
//   return r;
// }
//
// export function computed(getter: AnySupplier) {
//   let result = ref();
//   effect(() => (result.value = getter()));
//   return result;
// }
