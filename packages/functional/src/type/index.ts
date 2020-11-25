export type Fun = (...args: any[]) => any

export interface IContainer<T> {
  map: (...args: [unknown]) => IContainer<T>
}