import { SchemaObject } from 'openapi3-ts'

export interface IWalkerState {
  depth: number
  seen: WeakMap<SchemaObject, boolean>
  top: boolean
  combine: boolean
  property?: string
}
