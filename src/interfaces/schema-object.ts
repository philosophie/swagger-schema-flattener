import { SchemaObject } from 'openapi3-ts'
import { ISchemaWalkerExt } from './schema-walker'

export interface ISchemaObject extends SchemaObject {
  'x-schema-walker': ISchemaWalkerExt
}
