import { Container } from "./maybe"
import { Fun, IContainer } from "../type"
import { curry } from "../util"

export class Left<Value = unknown> extends Container<Value> implements IContainer<Value> {
  constructor(value: Value) {
    super(value)
  }
  static of<Value>(value: Value): Left<Value> {
    return new Left(value)
  }
  // Left 会忽略 fn
  map(): Left<Value> {
    return this
  }
  join() : ThisType<Value> {
    return this
  }
  chain() : ThisType<Value> {
    return this
  }
  // ap 实现
  public ap(functor: IContainer<unknown>): IContainer<unknown> {
    return functor.map(this.value)
  }
}

export class Right<Value = unknown> extends Container<Value> implements IContainer<Value> {
  constructor(value: Value) {
    super(value)
  }
  static of<Value>(value: Value): Right<Value> {
    return new Right(value)
  }
  map<Fn extends  (...args: [unknown]) => any>(fn: Fn): Right<ReturnType<Fn>> {
    return Right.of(fn(this.__value))
  }
  join(): Value {
    return this.value
  }
  chain(fn: Fun): ThisType<Fun> {
    return this.map(fn).join()
  }
  // ap 实现
  public ap(functor: IContainer<unknown>): IContainer<unknown> {
    return functor.map(this.value)
  }
}

export const either = curry((leftFn: Fun, rightFn: Fun, functor: Left | Right) => {
  switch(functor.constructor) {
    case Left: return leftFn(functor.value)
    case Right: return rightFn(functor.value)
  }
})