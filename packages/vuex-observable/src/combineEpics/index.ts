import { Action } from '../createEpicPlugin'
import { merge } from 'rxjs'
import { Epic } from '../epic'

/**
 * @public
 */
export function combineEpics<
  T extends Action, 
  O extends T = T, 
  S = void, 
  D = unknown
>(...epics: Epic<T, O, S, D>[]): Epic<T, O, S, D> {
  const merger = (...args: Parameters<Epic>) => merge(
    ...epics.map(epic => {
      const output$ = epic(...args)
      if(!output$) {
        throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream. Double check you're not missing a return statement!`)
      }
      return output$
    })
  )

  try {
    Object.defineProperty(merger, 'name', {
      value: `combineEpics(${epics.map(epic => epic.name || '<anonymous>').join(', ')})`,
    })
  // eslint-disable-next-line no-empty
  } catch (e) {}

  return merger
}