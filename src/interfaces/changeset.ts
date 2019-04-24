import { ChangesetOperation } from '../enums'

export interface IChangeset {
  path: string
  operation: ChangesetOperation
  value?: string | boolean | number
}
