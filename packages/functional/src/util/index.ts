import { Left, Right } from ".."

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

export const curry = (fn, arity: number = fn.length, nextCurried?: any) => 
  (nextCurried = prevArgs => 
    (...nextArgs) => {
      const args = [ ...prevArgs, ...nextArgs ]
      return args.length >= arity
        ? fn(...args)
        : nextCurried(args)
    }
  )([])

export const compose = (...fns) => 
  fns.length <= 1
    ? fns[0]
    : fns.reduce((prev, curr) => (...args) => prev(curr(...args)))

export const either = curry((leftFn, rightFn, functor) => {
  switch(functor.constructor) {
    case Left: return leftFn(functor.__value)
    case Right: return rightFn(functor.__value)
  }
})


var haha = curry(
  (a, b): number => a + b
)
var hehe = haha(3)

console.log(hehe);

