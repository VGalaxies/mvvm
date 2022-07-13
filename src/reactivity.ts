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
const effectStack: Array<EffectFn> = []; // for nested effect

const targetMap = new WeakMap();

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

function trigger(target: object, key: PropertyKey) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = depsMap.get(key);
  if (deps) {
    const effectsToRun = new Set();
    deps.forEach((effectFn: EffectFn) => {
      // get-and-set
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
    effectsToRun.forEach((effectFn: EffectFn) => {
      // intro scheduler
      if (effectFn.options.scheduler) {
        effectFn.options.scheduler(effectFn);
      } else {
        effectFn();
      }
    });
  }
}

export function reactive(target: object) {
  const handlers = {
    get(target: object, key: PropertyKey, receiver: any) {
      let result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target: object, key: PropertyKey, value: any, receiver: any) {
      // https://bobbyhadz.com/blog/typescript-no-index-signature-with-parameter-of-type
      let oldValue = target[key as keyof typeof target];
      let result = Reflect.set(target, key, value, receiver);
      if (result && oldValue != value) {
        trigger(target, key);
      }
      return result;
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
