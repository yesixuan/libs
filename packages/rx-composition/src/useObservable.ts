import { ref, onMounted, onUnmounted, watch, UnwrapRef, Ref } from 'vue'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'

import { RestrictArray } from './types'

export type InputFactory<State> = (state$: Observable<State>) => Observable<State>
export type InputFactoryWithInputs<State, Inputs> = (
  state$: Observable<State>,
  inputs$: Observable<RestrictArray<Inputs>>,
) => Observable<State>

export function useObservable<State>(inputFactory: InputFactory<State>): Ref<UnwrapRef<State> | undefined> | null
export function useObservable<State>(inputFactory: InputFactory<State>, initialState: State): Ref<UnwrapRef<State> | undefined>
export function useObservable<State, Inputs>(
  inputFactory: InputFactoryWithInputs<State, Inputs>,
  initialState: State,
  inputs: RestrictArray<Inputs>,
): Ref<UnwrapRef<State> | undefined>
export function useObservable<State, Inputs extends ReadonlyArray<any>>(
  inputFactory: InputFactoryWithInputs<State, Inputs>,
  initialState?: State,
  inputs?: RestrictArray<Inputs>,
): Ref<UnwrapRef<State> | undefined> | null {
  const state = ref(initialState)
  const state$ = new BehaviorSubject(initialState)
  const inputs$ = new BehaviorSubject(inputs)
  let subscription: Subscription

  if (inputs && inputs.length) {
    watch(inputs, (currInputs) => {
      inputs$.next(currInputs as RestrictArray<Inputs>)
    })
  }

  onMounted(() => {
    let output$: BehaviorSubject<State>
    if (inputs && inputs.length) {
      output$ = (inputFactory as (
        state$: Observable<State | undefined>,
        inputs$: Observable<RestrictArray<Inputs> | undefined>,
      ) => Observable<State>)(state$, inputs$) as BehaviorSubject<State>
      // output$ = inputFactory(state$, inputs$)
    } else {
      output$ = ((inputFactory as unknown) as (state$: Observable<State | undefined>) => Observable<State>)(
        state$,
      ) as BehaviorSubject<State>
      // output$ = inputFactory(state$)
    }
    subscription = output$.subscribe(value => {
      state$.next(value)
      state.value = value as UnwrapRef<State> | undefined
    })
  })

  onUnmounted(() => {
    subscription && subscription.unsubscribe()
    inputs$.complete()
    state$.complete()
  })

  return state
}
