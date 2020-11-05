import { Left, Right } from ".."

export const partial = (fn, ...presetArgs) =>
  (...laterArgs) => 
    fn(...presetArgs, ...laterArgs)

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


  
