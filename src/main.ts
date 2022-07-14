import { createRenderer } from "./runtime-core";

const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  insert(el, parent, anchor) {
    parent.insertBefore(el, anchor);
  },
  patchProps(el, key, prevValue, nextValue) {
    if (key === "class") {
      // for efficiency
      // since `"class" in el` is false, and `setAttribute` is slower
      el.className = nextValue || "";
    } else {
      if (key in el) {
        // set DOM properties first
        const type = typeof el[key as keyof typeof el];
        // handle button disabled
        if (type === "boolean" && nextValue === "") {
          // @ts-ignore
          el[key as keyof typeof el] = true;
        } else {
          // @ts-ignore
          el[key as keyof typeof el] = nextValue;
        }
      } else {
        el.setAttribute(key, nextValue);
      }
    }
  },
});

const prev = {
  type: "h1",
  props: {
    id: "good",
  },
  children: "hello",
};

const next = {
  type: "h1",
  props: {
    id: "bad",
  },
  children: "hello",
};

const container = document.getElementById("app");

renderer.render(prev, container);
renderer.patch(prev, next, container);

// renderer.render(
//   {
//     type: "button",
//     props: {
//       disabled: "",
//     },
//   },
//   container
// );

// renderer.render(
//   {
//     type: "button",
//     props: {
//       disabled: false,
//     },
//   },
//   container
// );
