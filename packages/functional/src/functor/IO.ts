import { Fun } from "../type"
import { compose } from "../util"

// IO 函子实际上是将副作用包裹在一个函数中延迟执行，这样一来，它还是一个纯函数
export class IO<Fn extends Fun> {
  private unsafePerformIO: Fn
  constructor(fn: Fn) {
    this.unsafePerformIO = fn
  }
  static of<Fn extends Fun>(fn: Fn): IO<Fun> {
    return new IO(fn)
  }
  map(fn: Fn): IO<Fun> {
    // 与普通函子不同的是：普通函数调用 fn，而 IO 函子组合 fn
    return IO.of(compose(fn, this.unsafePerformIO))
  }
  get effect(): Fun {
    return this.unsafePerformIO
  }
  join(): ReturnType<Fn> {
    return this.unsafePerformIO()
  }
  chain(fn: Fn): ThisType<Fn> {
    return this.map(fn).join()
  }
}