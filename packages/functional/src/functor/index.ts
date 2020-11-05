import { compose } from ".."

class Container<Value> {
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
  private isNothing(): boolean {
    return this.__value === null || this.__value === undefined
  }
  // Maybe 的 map 会检测内部的值是否有效
  public map<Fn extends (...args: any) => any>(fn: Fn): Maybe<null | ReturnType<Fn>> {
    return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this.__value!))
  }
}

export class Left<Value = any> extends Container<Value> {
  constructor(value) {
    super(value)
  }
  static of<Value>(value: Value): Left<Value> {
    return new Left(value)
  }
  // Left 会忽略 fn
  map(_: any) {
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
}

// IO 函子实际上是将副作用包裹在一个函数中延迟执行，这样一来，它还是一个纯函数
export class IO<Fn extends Function> {
  private unsafePerformIO: Fn
  constructor(fn: Fn) {
    this.unsafePerformIO = fn
  }
  static of<Fn extends Function>(fn): IO<Fn> {
    return new IO(fn)
  }
  map(fn) {
    // 与普通函子不同的是：普通函数调用 fn，而 IO 函子组合 fn
    return IO.of(compose(fn, this.unsafePerformIO))
  }
  get effect(): Function {
    return this.unsafePerformIO
  }
}

