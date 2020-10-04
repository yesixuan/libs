# @ignorance/rx-composition

> rx composition API for vue3.

# Installation

```sh
yarn add @ignorance/rx-composition
```

# Quick look

## useObservable

```js
import { map } from 'rxjs/operators'
import { interval } from 'rxjs'
import { useObservable } from '@ignorance/rx-composition'

export default function setup() {
  const value = useObservable(
    () => interval(500).pipe(map((val) => val * 3)),
    0, // initial state
  )
  return {
    value
  }
}
```

## useEventCallback

```js
import { map } from 'rxjs/operators'
import { interval } from 'rxjs'
import { useObservable } from '@ignorance/rx-composition'

export default function setup() {
  const [clickCallback, content] = useEventCallback(event$ =>
    event$.pipe(
      map(event => event.target.innerHTML),
    ),
    "nothing", // initial state
  )
  return {
    value
  }
}
```

# apis

## useObservable

[live demo](https://stackblitz.com/edit/rx-composition-demo?file=src%2Fcomponents%2FDebounceNum.vue)

### With default value:

```js
const value = useObservable(() => of(1000), 200)
```

### Observe props change:

```js
const value = useObservable((_, inputs$) => inputs$.pipe(
  map(([val]) => val + 1),
), 200, [props.foo])
```

### useObservable with state$

```js
const value = useObservable((state$) => interval(1000).pipe(
  withLatestFrom(state$),
  map(([_num, state]) => state * state),
), 2)
```

## useEventCallback

[live demo](https://stackblitz.com/edit/rx-composition-demo?file=src%2Fcomponents%2FFollow.vue)

### With initial value:

```js
const [clickCallback, value] = useEventCallback((event$) =>
  event$.pipe(
    mapTo(1000)
  ),
  200,
)
```

### With state$:

```js
const [clickCallback, [description, x, y, prevDescription]] = useEventCallback(
  (event$, state$) =>
    event$.pipe(
      withLatestFrom(state$),
      map(([event, state]) => [
          event.target.innerHTML,
          event.clientX,
          event.clientY,
        state[0],
      ])
    ),
  ["nothing", 0, 0, "nothing"]
)
```