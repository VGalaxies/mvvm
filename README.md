# info

基础要求：

- 实现数据劫持
- 实现发布订阅模式
- 实现数据单向绑定
- 实现双向绑定

项目要求：

- 要有 README
- 使用 TypeScript
- 单测覆盖率 80%

代码可读性考察：

- 命名、注释、代码组织结构
- 设计能力：层次分明、抽象能力、可扩展性、模块切分、数据封装

# init

```
npm init
```

## webpack

https://www.webpackjs.com/guides/getting-started/

https://www.webpackjs.com/guides/development/

```
npm install --save-dev webpack webpack-cli webpack-dev-server
```

在 webstorm 中配置关闭 **safe write**, i.e., back up files before saving

## typescript

https://www.webpackjs.com/guides/typescript/

```
npm install --save-dev typescript ts-loader
sudo npm install -g typescript
```

## debugger

- dist

Chrome instead of Firefox

- test

debug in webstorm

## prettier

```
npm install --save-dev prettier
sudo npm install -g prettier
```

在 webstorm 中配置 prettier package 路径

## eslint

```
npm install --save-dev eslint
eslint --init
```

目前感觉没有必要

# publish subscribe

https://juejin.cn/post/6844903850105634824

# test

## mocha

使用测试框架 https://mochajs.org/

```
npm install --save-dev mocha @types/mocha ts-node
```

https://github.com/mochajs/mocha-examples/tree/master/packages/typescript

```
mocha --reporter spec --require ts-node/register test/*.test.ts
```

报错参考如下处理

https://github.com/TypeStrong/ts-node/issues/1062#issuecomment-767482736

参考 https://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html，引入 https://github.com/adamgruber/mochawesome
展示测试报告

## chai

使用断言库 https://www.chaijs.com/

## test-console

参考 https://stackoverflow.com/questions/30625404/how-to-unit-test-console-output-with-mocha-on-nodejs，使用 https://github.com/jamesshore/test-console
测试 console 输出

## jsdom

使用 https://github.com/jsdom/jsdom 测试 DOM

```
npm install --save-dev jsdom @types/jsdom
```

需要在测试目录添加 `init-test-runtime.ts`

```typescript
import {JSDOM} from "jsdom";

export const dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
global.document = dom.window.document;
```

并修改命令，添加 `--require init-test-runtime.ts`，注意 `require` 的顺序

后来发现需要在每次测试前重置 DOM，于是将相关代码移入测试文件

```tsx
describe("runtime-core-test", () => {
    let dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
    global.document = dom.window.document;

    beforeEach(() => {
        // reset
        dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
    });
```

## istanbul & nyc

使用 https://istanbul.js.org/ 测试覆盖率

```
npm install --save-dev istanbul
```

使用如下命令

```
"coverage": "istanbul cover _mocha -- --require ts-node/register test/*.test.ts"
```

会报错

```
No coverage information was collected, exit without writing coverage information.
```

于是考虑使用 nyc

```
npm install --save-dev nyc
```

使用如下命令

```
"coverage": "nyc mocha --require ts-node/register test/*.test.ts"
```

即可

# vue

## resources

- interview

https://vue3js.cn/interview/

- mini-vue

https://github.com/cuixiaorui/mini-vue

- vue-3-reactivity

https://www.bilibili.com/video/BV1SZ4y1x7a9

https://github.com/Code-Pop/vue-3-reactivity

- vue-overview

https://www.bilibili.com/video/BV1rC4y187Vw

https://www.cnblogs.com/guangzan/p/13358322.html

https://template-explorer.vuejs.org/

## stage

https://book.douban.com/subject/35768338/

https://github.com/HcySunYang/code-for-vue-3-book

- 3 all
- 4.1 ~ 4.8
- 5.1 ~ 5.6
- 6.1 ~ 6.3
- 7 all
- 8.1 ~ 8.9
- 12.1 ~ 12.6

# doc

## reactivity

### reactive

返回对象的响应式代理

```typescript
const obj = reactive({count: 0})
```

响应式转换是深层的，它影响所有嵌套 property

### readonly

返回对象的响应式只读代理，只读代理是深层的

```typescript
const original = readonly({count: 0})
```

### shallowReactive

```typescript
const state = shallowReactive({
    foo: 1,
    nested: {
        bar: 2
    }
})
```

创建一个响应式代理，它跟踪其自身 property 的响应性，但不执行嵌套对象的深层响应式转换

### shallowReadonly

```typescript
const state = shallowReadonly({
    foo: 1,
    nested: {
        bar: 2
    }
})
```

创建一个响应式代理，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换

### ref

```typescript
const count = ref(0)
```

接受一个内部值并返回一个响应式且可变的 ref 对象

ref 对象仅有一个 `.value` property，指向该内部值

### toRef

```typescript
const state = reactive({
    foo: 1,
    bar: 2
})

const fooRef = toRef(state, 'foo')
```

可以用来为源响应式对象上的某个 property 新创建一个 ref

### toRefs

```typescript
const state = reactive({
    foo: 1,
    bar: 2
})

const stateAsRefs = toRefs(state)
```

将响应式对象转换为 ref 对象，其中结果对象的每个 property 都是指向原始对象相应 property 的 ref

### proxyRefs

```typescript
const obj = reactive({foo: "hello", bar: "world"});
const newObj = proxyRefs({...toRefs(obj)});
```

为 ref 对象实现自动脱 ref，即不必使用 `.value`

### computed

```typescript
const product = reactive({price: 5, quantity: 2});

const salePrice = computed(() => {
    return product.price * 0.9;
});
```

接受一个 getter 函数，并根据 getter 的返回值返回一个不可变的响应式 ref 对象

### effect

主要负责收集依赖，更新依赖

effect 接收两个参数

- fn 回调函数
- options 参数
    - scheduler 自定义调度器
    - lazy 懒执行，优化 computed 的实现

## render

### VNode

类型定义如下

```typescript
export interface HTMLVirtualNode {
    type: string | ComponentOptions;
    children?: Array<HTMLVirtualNode> | string;
    props?: PropertyMap;
    el?: HTMLElementDetail;
    component?: ComponentInstance;
}

export interface HTMLElementWithVNode extends HTMLElement {
    vnode?: HTMLVirtualNode;
}

export interface HTMLElementDetail extends HTMLElement {
    [key: string]: any;

    vei?: { [key: string]: EventInvoker };
}

interface EventInvoker extends EventListener {
    value?: Array<(arg: Event) => any> | ((arg: Event) => any);
    attached?: number;
}
```

目前支持 HTML 标签和自定义组件两个类型

### createRenderer

返回 render 和 patch 工具函数

render 的签名如下

```typescript
function render(vnode: HTMLVirtualNode, container: HTMLElementWithVNode): void
```

patch 的签名如下

```typescript
function patch(
    n1: HTMLVirtualNode,
    n2: HTMLVirtualNode,
    container: HTMLElementWithVNode,
    anchor?: Node
): void
```

示例

```typescript
const app = document.getElementById("app");
const renderer = createRenderer();
const vnode = {
    type: "h1",
    props: {
        id: "good",
    },
    children: "hello",
};
renderer.render(vnode, app);
```

由于没有实现编译器，所以需要手写 vnode

## components

类型定义如下

```typescript
type EventEmitter = (event: string, ...args: any) => void;

interface SetupContext {
    attrs?: PropertyMap;
    emit?: EventEmitter;
}

export interface ComponentOptions {
    name: string;
    render?: VirtualNodeSupplier;
    data?: PropertyMapSupplier;
    props?: PropertyMap;
    setup?: (
        props: PropertyMap,
        context: SetupContext
    ) => VirtualNodeSupplier | PropertyMap;

    // hooks
    beforeCreate?: VoidSupplier;
    created?: VoidSupplier;
    beforeMount?: VoidSupplier;
    mounted?: VoidSupplier;
    beforeUpdate?: VoidSupplier;
    updated?: VoidSupplier;
}

export interface ComponentInstance {
    state: PropertyMap; // deep reactive
    props: PropertyMap; // shallow reactive
    isMounted: boolean;
    subTree: HTMLVirtualNode;
}
```

在实现内部，组件 options 中的 `data` 会响应式转换为组件实例的 `state`，其渲染上下文为 `state / props / setupState`

示例

```typescript
const app = document.getElementById("app");
const renderer = createRenderer();
const component: ComponentOptions = {
    name: "demo",
    render() {
        return {
            type: "h1",
            props: {
                id: "good",
            },
            children: "hello",
        };
    },
};
renderer.render({type: component}, app);
```

支持 setup 渲染

```typescript
const app = document.getElementById("app");
const renderer = createRenderer();
const component: ComponentOptions = {
    name: "demo",
    setup() {
        return () => {
            return {
                type: "h1",
                props: {
                    id: "good",
                },
                children: "hello",
            };
        };
    },
};
renderer.render({type: component}, app);
```

## example

使用组件实现一个点击自增的计数器

```typescript
const counter: ComponentOptions = {
    name: "demo",
    data() {
        return {
            count: 0,
        };
    },
    render() {
        return {
            type: "button",
            props: {
                onClick: () => {
                    this.count++;
                    console.log(`${this.count}`);
                },
            },
            children: `${this.count}`,
        };
    },
};
```