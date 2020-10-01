# @ignorance/vuex-observable

> Consume Vuex actions as Observables using RxJS 6, inspired by [redux-observable](https://github.com/redux-observable/redux-observable).

# Usage

```js
import Vue from "vue";
import Vuex from "vuex";
import { createEpicPlugin, combineEpics } from "@ignorance/vuex-observable";
import {
  filter,
  delay,
  mapTo,
} from "rxjs/operators";

Vue.use(Vuex);

const pingEpic = action$ =>
  action$.pipe(
    filter(action => action.type === "test"),
    delay(1000), // Asynchronously wait 1000ms then continue
    mapTo({ type: "PONG", num: 10, isAction: false }) // mapTo('PONG')
  );

const vuexObservable = createEpicPlugin();

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    PING(state) {
      state.count++;
    },
    PONG(state, { num }) {
      state.count = state.count + num;
    }
  },
  actions: {
    test() {
      console.log("do test");
    }
  },
  plugins: [vuexObservable]
});

vuexObservable.run(combineEpics(pingEpic));
```