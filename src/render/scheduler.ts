import { EffectFn } from "../reactivity/effect";

const queue = new Set<EffectFn>();
let isFlushing = false;
const p = Promise.resolve();

export function queueJob(job: EffectFn) {
  queue.add(job);
  if (!isFlushing) {
    isFlushing = true;
    p.then(() => {
      try {
        queue.forEach((job) => job());
      } finally {
        isFlushing = false;
        queue.clear();
      }
    });
  }
}
