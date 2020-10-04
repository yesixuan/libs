import { ref, onMounted, onUnmounted, watch, UnwrapRef } from 'vue'
import { Subject, BehaviorSubject, Observable, Subscription } from 'rxjs'
import { RestrictArray, VoidAsNull, Not } from './types'

export type VoidableEventCallback<EventValue> = EventValue extends void ? () => void : (e: EventValue) => void

export type EventCallbackState<EventValue, State, Inputs = void> = [
  VoidableEventCallback<EventValue>,
  [State extends void ? null : State, BehaviorSubject<State | null>, BehaviorSubject<RestrictArray<Inputs> | null>],
]
export type ReturnedState<EventValue, State, Inputs> = [
  EventCallbackState<EventValue, State, Inputs>[0],
  EventCallbackState<EventValue, State, Inputs>[1][0],
]

export type EventCallback<EventValue, State, Inputs> = Not<
  Inputs extends void ? true : false,
  (
    eventSource$: Observable<EventValue>,
    state$: Observable<State>,
    inputs$?: Observable<RestrictArray<Inputs>>,
  ) => Observable<State>,
  (eventSource$: Observable<EventValue>, state$: Observable<State>) => Observable<State>
>

export function useEventCallback<EventValue>(
  callback: EventCallback<EventValue, void, void>,
): ReturnedState<EventValue, void | null, void>
export function useEventCallback<EventValue, State>(
  callback: EventCallback<EventValue, State, void>,
  initialState: State,
): ReturnedState<EventValue, State, void>
export function useEventCallback<EventValue, State, Inputs>(
  callback: EventCallback<EventValue, State, Inputs>,
  initialState: State,
  inputs: RestrictArray<Inputs>,
): ReturnedState<EventValue, State, Inputs>

export function useEventCallback<EventValue, State = void, Inputs = void>(
  callback: EventCallback<EventValue, State, Inputs>, 
  initialState?: State, 
  inputs?: RestrictArray<Inputs>,
): ReturnedState<EventValue, State | null, Inputs> {
  const initialValue = (typeof initialState !== 'undefined' ? initialState : null) as VoidAsNull<State>
  const state = ref<VoidAsNull<State>>(initialValue)
  const event$ = new Subject<EventValue>()
  const state$ = new BehaviorSubject<State | null>(initialValue)
  const inputs$ = new BehaviorSubject<RestrictArray<Inputs> | null>(typeof inputs === 'undefined' ? null : inputs)
  let subscription: Subscription

  function eventCallback(e: EventValue) {
    return event$.next(e)
  }

  if (inputs && inputs.length) {
    watch(inputs, (currInputs) => {
      inputs$.next(currInputs as RestrictArray<Inputs>)
    })
  }

  onMounted(() => {
    state.value = initialValue as UnwrapRef<VoidAsNull<State>>
    let value$: Observable<State>
    if (inputs && inputs.length) {
      value$ = (callback as EventCallback<EventValue, State, void>)(event$, state$ as Observable<State>)
    } else {
      value$ = (callback as any)(event$, state$, inputs$)
    }
    subscription = value$.subscribe(value => {
      state$.next(value)
      state.value = value as UnwrapRef<VoidAsNull<State>>
    })
  })

  onUnmounted(() => {
    subscription && subscription.unsubscribe()
    state$.complete()
    inputs$.complete()
    event$.complete()
  })

  return [eventCallback as VoidableEventCallback<EventValue>, state as unknown as EventCallbackState<EventValue, State, Inputs>[1][0]]
}
