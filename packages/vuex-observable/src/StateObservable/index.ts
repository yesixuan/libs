import { Observable, Subject } from 'rxjs'

// 创建 state observable 的类，初始值为 state
export class StateObservable<S> extends Observable<S> {
  value: S
  private __notifer = new Subject<S>()

  // input$ 外部传入的 subject，用来从外部发射新的值
  constructor(input$: Observable<S>, initialState: S) {
    super(subscriber => {
      const subscription = this.__notifer.subscribe(subscriber)
      if (subscription && !subscription.closed) {
        subscriber.next(this.value)
      }
      return subscription
    })

    this.value = initialState

    input$.subscribe(value => {
      this.value = value
      this.__notifer.next(value)
    })
  }

}