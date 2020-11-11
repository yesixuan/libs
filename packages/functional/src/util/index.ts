import { Left, Right } from ".."
import { F } from 'ts-toolbelt'

interface anyFn {
  (...args: any): any
}

interface partialType<RType> {
  (...args: any): RType
}

export function partial<T extends anyFn> (fn: T, ...presetArgs): partialType<ReturnType<T>> {
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

export const either = curry((leftFn, rightFn, functor) => {
  switch(functor.constructor) {
    case Left: return leftFn(functor.__value)
    case Right: return rightFn(functor.__value)
  }
})



