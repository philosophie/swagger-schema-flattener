import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
  SchemaObject
} from 'openapi3-ts'

import {
  getFlattenedSchemaFromParameters,
  getFlattenedSchemaFromRequestBody,
  getFlattenedSchemaFromResponses
} from './flatteners'
import { getFormattedRequestBodySchema, getFormattedResponseSchema } from './formatters'

/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @return {SchemaObject[]}
 */
export function flattenParamSchema(operation: OperationObject): SchemaObject[] {
  return getFlattenedSchemaFromParameters(operation.parameters as ParameterObject[])
}

/**
 * @description Converts the requestBody object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export function flattenRequestBodySchema(
  operation: OperationObject,
  contentType: string = 'application/json'
) {
  return getFlattenedSchemaFromRequestBody(operation.requestBody as RequestBodyObject, contentType)
}

/**
 * @description Converts the responses object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export function flattenResponseSchema(
  operation: OperationObject,
  contentType: string = 'application/json'
) {
  return getFlattenedSchemaFromResponses(operation.responses as ResponsesObject, contentType)
}

/**
 * @description Converts a flattened Request Body object from dereferenced
 *              endpoint's method into a formatted object of params.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export function formatRequestBody(
  operation: OperationObject,
  contentType: string = 'application/json'
) {
  return getFormattedRequestBodySchema(operation.requestBody as RequestBodyObject, contentType)
}

/**
 * @description Converts a flattened Request Body object from dereferenced
 *              endpoint's method into a formatted object of params.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export function formatResponses(
  operation: OperationObject,
  contentType: string = 'application/json'
) {
  return getFormattedResponseSchema(operation.responses as ResponsesObject, contentType)
}
