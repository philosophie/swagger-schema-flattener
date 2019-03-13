import { getDefaultState, walkSchema } from './walker'
import {
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
  ResponseObject,
  ResponsesObject
} from 'openapi3-ts'
import { set, omit } from 'lodash-es'

import { WalkerState } from './interfaces'

const minimalSchema = (schema: SchemaObject | ParameterObject) => {
  const newSchema = omit(schema, ['properties', 'items', 'content', 'x-swagger-schema-flattener'])

  if (newSchema.enum) {
    newSchema.enum = newSchema.enum.join(', ')
  }

  return newSchema
}

export const getFormattedRequestBodySchema = (
  requestBody: RequestBodyObject,
  contentType: string
) => {
  if (typeof requestBody === 'undefined') {
    return {}
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const formattedRequestBody = { requestBody: null } as any

  walkSchema(
    requestBody.content[contentType].schema,
    requestBody,
    wsState,
    (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
      if (parent.content && parent.content[contentType].schema) {
        set(formattedRequestBody, 'requestBody', minimalSchema(parent))
      } else {
        set(
          formattedRequestBody,
          schema['x-swagger-schema-flattener'].displayPath,
          minimalSchema(schema)
        )
      }
    }
  )
  return formattedRequestBody
}

export const getFormattedResponseSchema = (responses: ResponsesObject, contentType: string) => {
  if (typeof responses === 'undefined') {
    return {}
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  return Object.keys(responses).map((responseKey: string) => {
    const formattedResponse = {} as any

    if (responses[responseKey].content) {
      walkSchema(
        responses[responseKey].content[contentType].schema,
        responses[responseKey],
        wsState,
        (schema: SchemaObject, parent: ResponseObject, state: WalkerState) => {
          if (parent.content && parent.content[contentType].schema) {
            set(formattedResponse, responseKey, minimalSchema(parent))
          } else {
            set(
              formattedResponse,
              schema['x-swagger-schema-flattener'].displayPath,
              minimalSchema(schema)
            )
          }
        }
      )
    } else {
      set(formattedResponse, responseKey, minimalSchema(responses[responseKey]))
    }

    return formattedResponse
  })
}
