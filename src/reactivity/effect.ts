import { AnySupplier, PropertyMap } from "../type/global";
import { ITERATE_KEY, TriggerType } from "./type";

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

export function track(target: PropertyMap, key: PropertyKey) {
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

export function trigger(
  target: PropertyMap,
  key: PropertyKey,
  type?: TriggerType
) {
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
