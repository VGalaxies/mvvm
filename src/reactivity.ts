const targetMap = new WeakMap(); // targetMap stores the effects that each object should re-run when it's updated
let activeEffect: Function = null; // The active effect running

function track(target: object, key: PropertyKey) {
  if (activeEffect) {
    // <------ Check to see if we have an activeEffect
    // We need to make sure this effect is being tracked.
    let depsMap = targetMap.get(target); // Get the current depsMap for this target
    if (!depsMap) {
      // There is no map.
      targetMap.set(target, (depsMap = new Map())); // Create one
    }
    let dep = depsMap.get(key); // Get the current dependencies (effects) that need to be run when this is set
    if (!dep) {
      // There is no dependencies (effects)
      depsMap.set(key, (dep = new Set())); // Create a new Set
    }
    dep.add(activeEffect); // Add effect to dependency map
  }
}

function trigger(target: object, key: PropertyKey) {
  const depsMap = targetMap.get(target); // Does this object have any properties that have dependencies (effects)
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key); // If there are dependencies (effects) associated with this
  if (dep) {
    dep.forEach((effect: Function) => {
      // run them all
      effect();
    });
  }
}

export function reactive(target: object) {
  const handlers = {
    get(target: object, key: PropertyKey, receiver: any) {
      let result = Reflect.get(target, key, receiver);
      track(target, key); // If this reactive property (target) is GET inside then track the effect to rerun on SET
      return result;
    },
    set(target: object, key: PropertyKey, value: any, receiver: any) {
      // https://bobbyhadz.com/blog/typescript-no-index-signature-with-parameter-of-type
      let oldValue = target[key as keyof typeof target];
      let result = Reflect.set(target, key, value, receiver);
      if (result && oldValue != value) {
        trigger(target, key); // If this reactive property (target) has effects to rerun on SET, trigger them.
      }
      return result;
    },
  };
  return new Proxy(target, handlers);
}

export function ref(raw?: any) {
  const r = {
    get value() {
      track(r, "value");
      return raw;
    },
    set value(newVal) {
      raw = newVal;
      trigger(r, "value");
    },
  };
  return r;
}

export function effect(eff: Function) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

export function computed(getter: Function) {
  let result = ref();
  effect(() => (result.value = getter()));
  return result;
}
