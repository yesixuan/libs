import { Container } from "./maybe"
import { Fun } from "../type"
import { curry } from "../util"

export class Left<Value = any> extends Container<Value> {
  constructor(value: Value) {
    super(value)
  }
  static of<Value>(value: Value): Left<Value> {
    return new Left(value)
  }
  // Left 会忽略 fn
  map(_: Fun): ThisType<Value> {
    return this
  }
  join() : ThisType<Value> {
    return this
  }
  chain() : ThisType<Value> {
    return this
  }
}

export class Right<Value = any> extends Container<Value> {
  constructor(value: Value) {
    super(value)
  }
  static of<Value>(value: Value): Right<Value> {
    return new Right(value)
  }
  map<Fn extends  (...args: any) => any>(fn: Fn): Right<ReturnType<Fn>> {
    return Right.of(fn(this.__value))
  }
  join(): Value {
    return this.value
  }
  chain(fn: Fun): ThisType<Fun> {
    return this.map(fn).join()
  }
}

export const either = curry((leftFn: Fun, rightFn: Fun, functor: Left | Right) => {
  switch(functor.constructor) {
    case Left: return leftFn(functor.value)
    case Right: return rightFn(functor.value)
  }
})