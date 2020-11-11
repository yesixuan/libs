import { curry } from "../util"
import { Fun } from '../type';

export class Container<Value> {
  protected __value: Value
  constructor(value: Value) {
    this.__value = value
  }
  get value(): Value {
    return this.__value
  }
}

export class Maybe<Value = any> extends Container<Value> {
  constructor(value: Value) {
    super(value)
  }
  static of<Value>(value: Value): Maybe<Value> {
    return new Maybe(value)
  }
  public isNothing(): boolean {
    return this.__value === null || this.__value === undefined
  }
  // Maybe 的 map 会检测内部的值是否有效
  public map<Fn extends (...args: any) => any>(fn: Fn): Maybe<null | ReturnType<Fn>> {
    return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this.__value!))
  }
}

export function handleMaybe(errorMessage: string, fn: Fun, functor: Maybe): string | ReturnType<Fun> {
  return functor.isNothing() ? errorMessage : fn(functor.value)
}

export const maybe = curry(handleMaybe)