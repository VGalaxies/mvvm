import { h, mount, patch, VNode } from "./runtime-core";
import { computed, reactive } from "./reactivity";

// const vdom1 = h("div", { class: "red" }, [h("span", null, "hello")]);
// mount(vdom1, document.getElementById("app"));
// const vdom2 = h("div", { class: "green" }, [h("span", null, "world")]);
// patch(vdom1, vdom2);

interface App {
  data?: any;
  render: () => VNode;
}

const app: App = {
  data: reactive({
    count: 0,
  }),
  render() {
    return h(
      "div",
      {
        // Uncaught SyntaxError: Function statements require a function name
        onClick: function foo() {
          app.data.count++;
        },
      },
      String(app.data.count)
    );
  },
};

function mountApp(component: App, container: HTMLElement) {
  let isMounted = false;
  let oldNode: VNode;
  computed(() => {
    if (!isMounted) {
      oldNode = component.render();
      mount(oldNode, container);
      isMounted = true;
    } else {
      const newNode = component.render();
      patch(oldNode, newNode);
      oldNode = newNode;
    }
  });
}

mountApp(app, document.getElementById("app"));
