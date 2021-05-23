## Usage

```ts
import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import testModule, { TestState } from './test_module'
import main,{MainType} from '@/modules/main/store'
import details, { Detail } from '@/modules/detail-form/store'
import { GetActionsType, GetGettersType, GetMutationsType, GetPayLoad, GetReturnType } from './type'

export const vuexOptions = {
  state () {
    return {
      count: 0,
    }
  },
  getters: {
    getCount (state: RootState) {
      return state.count
    },
  },
  mutations: {
    increment (state: RootState) {
      state.count++
    },
  },
  modules: {
    testModule,
    main,
    details: details,
  },
}

type Mutations = GetMutationsType<typeof vuexOptions>

type Actions = GetActionsType<typeof vuexOptions>

export type Getters = GetGettersType<typeof vuexOptions>

declare module 'vuex' {
  export interface Commit {
      <T extends keyof Mutations>(type: T, payload?: GetPayLoad<Mutations, T>, options?: any): GetReturnType<Mutations, T>;
  }
  export interface Dispatch {
      <T extends keyof Actions>(type: T, payload?: GetPayLoad<Actions, T>, options?: any): Promise<GetReturnType<Actions, T>>;
  }
}

export interface Commit {
  <T extends keyof Mutations>(type: T, payload?: GetPayLoad<Mutations, T>, options?: any): GetReturnType<Mutations, T>;
}
export interface Dispatch {
  <T extends keyof Actions>(type: T, payload?: GetPayLoad<Actions, T>, options?: any): Promise<GetReturnType<Actions, T>>;
}


export interface RootState {
  count: number,
}

export interface AllStateTypes extends RootState {
  testModule: TestState
  main:MainType
  details: { list: Detail[]}
}

export const key: InjectionKey<Store<AllStateTypes>> = Symbol()

// Create a new store instance.
const store = createStore<RootState>(vuexOptions)

export default store

export function useStore (): { commit: Commit, dispatch: Dispatch, getters: Getters } {
  return baseUseStore(key)
}
```