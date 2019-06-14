import { IRemoteSchema } from './remote-schema'

export interface IConstants {
  readonly API_SPECS: IRemoteSchema[]
  readonly PARAMETER: string
  readonly RESPONSE: string
  readonly REQUEST_BODY_PARAM: string
  readonly EXAMPLE: string
  readonly X_SCHEMA_WALKER: string
  readonly X_SCHEMA_WALKER_PATH_PREFIX: string
}
