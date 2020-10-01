import { Subject, from, queueScheduler } from 'rxjs'
import { map, mergeMap, observeOn, subscribeOn } from 'rxjs/operators'
import { Store } from 'vuex'
import { StateObservable } from '../StateObservable'
import { Epic } from '../epic'

export interface Action<T = any> {
  type: T
}

interface Options<D = any> {
  dependencies?: D
}

export interface EpicMiddleware<
  T extends Action,
  O extends T = T,
  S = void,
  D = any
> {
  <S>(store: Store<S>): void
  run(rootEpic: Epic<T, O, S, D>): void
}

interface OwnAction<T> extends Action<T> {
  payload?: any,
  isAction?: boolean
}

// eslint-disable-next-line @typescript-eslint/ban-types
const getType = (target: string | Object): string => {
  if (typeof target === 'object') {
    return (target as OwnAction<string>).type
  }
  return target
}

/**
 * @public
 */
export function createEpicPlugin<
  T extends Action,
  O extends T = T,
  S = void,
  D = any
> (options: Options<D> = {}): EpicMiddleware<T, O, S, D> {
  const QueueScheduler: any = queueScheduler.constructor
  const uniqueQueueScheduler: typeof queueScheduler = new QueueScheduler(
    (queueScheduler as any).SchedulerAction
  )

  const epic$ = new Subject<Epic<T, O, S, D>>()
  let store: Store<any>

  // 这个中间件柯里化了三次，第一次传入store，第二次传入next，第三次传入action
  const epicMiddleware: EpicMiddleware<T, O, S, D> = (_store: Store<any>) => {
    store = _store
    const actionSubject$ = new Subject<T>()
    const stateSubject$ = new Subject<S>()
    const action$ = actionSubject$
      .asObservable()
      .pipe(observeOn(uniqueQueueScheduler))

    const state$ = new StateObservable(
      stateSubject$.pipe(observeOn(uniqueQueueScheduler)),
      store.state
    )

    // 这个流接收的只是 epic 函数
    const result$ = epic$.pipe(
      map(epic => {
        // 调用了所有 epic 函数（在 epic 函数内部对 action$ 进行了监听、转化）
        // 这里的 output$ 是所有对 action$ 转化之后的集合
        const output$ = epic(action$, state$, options.dependencies!)
        if (!output$) {
          throw new TypeError(
            `Your root Epic "${epic.name ||
              '<anonymous>'}" does not return a stream. Double check you're not missing a return statement!`
          );
        }
        
        return output$;
      }),
      mergeMap(output$ => 
        from(output$).pipe(
          subscribeOn(uniqueQueueScheduler),
          observeOn(uniqueQueueScheduler)
        )
      )
    )
    // 输出流之后触发 dispatch 方法
    // result$.subscribe(store.dispatch)
    result$.subscribe((action: OwnAction<any>) => {
      
      if (typeof action === 'object' && action.isAction) {
        store.dispatch(action);
      } else {
        store.commit(action);
      }
    })

    const { dispatch, commit } = store
    
    store.dispatch = (...args: any[]) => {
      
      typeof args[0] === 'object'
        ? actionSubject$.next(args[0])
        : actionSubject$.next({ type: args[0], payload: args[1] } as any)

      const type = getType(args[0])
      // 如果定义了 action 就执行原来的 action， 没有就作罢
      if ((store as any)._actions[type]) {
        if (typeof args[0] === 'object') {
          return Promise.resolve(dispatch.call(store, args[0].type, args[0].payload || null));
        }
        return Promise.resolve(dispatch.call(store, args[0], args[1]));
      }
      return Promise.resolve('没有找到该类型的 action')
    }
    store.commit = (...args: any[]) => {
      
      const type = getType(args[0])

      // 如果定义了 mutation 就执行原来的 mutation， 没有就作罢
      if ((store as any)._mutations[type]) {
        if (typeof args[0] === 'object') {
          commit.call(store, args[0].type, args[0].payload || null);
        } else {
          commit.call(store, args[0], args[1]);
        }
        stateSubject$.next(store.state);
      }
    }
  }

  // run 方法执行之后，所有监视器已经架设好
  epicMiddleware.run = rootEpic => {    
    if (process.env.NODE_ENV !== 'production' && !store) {
      console.warn(
        'epicMiddleware.run(rootEpic) called before the middleware has been setup by redux. Provide the epicMiddleware instance to createStore() first.'
      );
    }
    epic$.next(rootEpic);
  }

  return epicMiddleware
}
