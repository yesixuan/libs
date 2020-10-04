# @ignorance/vuex-observable

> Consume Vuex actions as Observables using RxJS 6, inspired by [redux-observable](https://github.com/redux-observable/redux-observable).

<iframe src="https://codesandbox.io/embed/black-architecture-sb4g8?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="black-architecture-sb4g8"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## 一览

以下示例使用 `vue3` 的函数式 API。`vue2` 的用法与之类似，这里不再赘述。
```js
import { createStore } from "vuex";
import { 
  combineEpics, 
  createEpicPlugin,
  Epic
} from '@ignorance/vuex-observable'
import {
  filter,
  map,
} from "rxjs/operators";

const pingEpic: Epic= (action$) => action$.pipe(
  filter(action => action.type === "test"),
  delay(1000), // Asynchronously wait 1000ms then continue
  mapTo({ type: "PONG", payload: 10, isAction: false }) // mapTo('PONG')
);
 
const vuexObservable = createEpicPlugin();

export default createStore({
  state: {
    count: 0,
  },
  mutations: {
    PONG(state, num) {
      state.count = state.count + num;
    },
  },
  plugins: [vuexObservable],
});

vuexObservable.run(combineEpics(pingEpic));
```

## 安装

```sh
npm i @ignorance/vuex-observable
```

## 使用

```js
// store.js
import { createEpicPlugin } from '@ignorance/vuex-observable'

const vuexObservable = createEpicPlugin();

export default createStore({
  // ...
  plugins: [vuexObservable],
});

vuexObservable.run();
```

## 装配 epic

```ts
import { combineEpics, Epic } from '@ignorance/vuex-observable'
// 定义 epic
// 拦截 type 为 “test” 的 action，延时1秒后，转化为一个新的 mutation 发射出去
const pingEpic: Epic= action$ => action$.pipe(
  filter(action => action.type === "test"),
  delay(1000), // Asynchronously wait 1000ms then continue
  mapTo({ type: "PONG", payload: 10, isAction: false }) // mapTo('PONG')
);

// 装配
vuexObservable.run(combineEpics(pingEpic));
```

## 食谱

### 数字跳动

```js
const takeUntilFunc = (endRange: number, currentNumber: number) => {
  return endRange > currentNumber
    ? (val: number) => val <= endRange
    : (val: number) => val >= endRange;
};

const positiveOrNegative = (endRange: number, currentNumber: number) => {
  return endRange > currentNumber ? 1 : -1;
};

const otometerEpic: Epic = (action$, state$, _, variable = 0) => action$.pipe(
  filter(action => action.type === "otometer"),
  withLatestFrom(state$),
  switchMap(([{ payload: endRange }, state]) => {
    return timer(0, 20).pipe(
      tap(() => variable = state.currentNumber),
      mapTo(positiveOrNegative(endRange, variable)),
      startWith(variable),
      scan((acc, curr) => acc + curr),
      takeWhile(takeUntilFunc(endRange, state.currentNumber)),
    )
  }),
  map(val => ({ type: 'BEAT', payload: val, isAction: false })),
  startWith(variable),
)

export default createStore({
  state: {
    currentNumber: 0,
  },
  mutations: {
    BEAT(state, num) {
      state.currentNumber = num
    },
  },
  plugins: [vuexObservable],
});

vuexObservable.run(combineEpics(otometerEpic));
```

### 鼠标跟随动画

```vue
<template>
  <div @mousemove="e => $store.dispatch('follow', e)">
    <div 
      v-for="(pos, index) in $store.state.pos"
      :key="index"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    ></div>
  </div>
</template>
```
```js
const followEpic: Epic= (action$, state$, store) => action$.pipe(
  filter(action => action.type === "follow"),
  withLatestFrom(state$),
  tap(([action, state]) => store.commit("FOLLOW", { index: 0, x: action.payload.clientX, y: action.payload.clientY })),
  delay(200),
  tap(([action, state]) => store.commit("FOLLOW", { index: 1, x: action.payload.clientX, y: action.payload.clientY })),
  delay(200),
  tap(([action, state]) => store.commit("FOLLOW", { index: 2, x: action.payload.clientX, y: action.payload.clientY })),
  delay(200),
  tap(([action, state]) => store.commit("FOLLOW", { index: 3, x: action.payload.clientX, y: action.payload.clientY })),
);
 
const vuexObservable = createEpicPlugin();

export default createStore({
  state: {
    pos: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
  },
  mutations: {
    FOLLOW(state, {index, ...pos}) {
      state.pos[index] = pos
    }
  },
  plugins: [vuexObservable],
});

vuexObservable.run(combineEpics(followEpic));
```