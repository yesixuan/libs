import { F } from 'ts-toolbelt'
interface anyFn {
  (...args: any): any
}

interface partialType<RType> {
  (...args: any): RType
}

export function partial<T extends anyFn> (fn: T, ...presetArgs: unknown[]): partialType<ReturnType<T>> {
  return (...laterArgs) => 
    fn(...presetArgs, ...laterArgs)
}

export function curry<Fn extends F.Function>(cb: Fn): F.Curry<Fn> {
  return (...args) => {
    if (args.length < cb.length) {
      return curry.bind(cb.bind(null, ...args))
    } else {
      return cb(...args)
    }
  }
}

export const compose: F.Compose = (...fns) => 
  fns.length <= 1
    ? fns[0]
    : fns.reduce((prev, curr) => (...args) => prev(curr(...args)))

export const liftA2 = curry(
  (fn, functor1, functor2) => functor1.map(fn).ap(functor2)
)

export const liftA3 = curry(
  (fn, functor1, functor2, functor3) => functor1.map(fn).ap(functor2).ap(functor3)
)

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}

export const identify = v => v

