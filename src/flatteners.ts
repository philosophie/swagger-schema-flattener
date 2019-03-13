import { getDefaultState, walkSchema } from './walker'
import {
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
  ResponseObject,
  SchemaObject
} from 'openapi3-ts'
import { cloneDeep, omit } from 'lodash-es'

import { SwaggerSchemaFlattenerExtension, WalkerState, CustomRequestBodyObject } from './interfaces'

// We get back undefined from oas-schema-walker, so need to deal with that
const buildNewKey = (oldKey: string, newProperty: string | undefined): string => {
  return (oldKey += typeof newProperty === 'undefined' ? '' : `.${newProperty}`)
}

const buildRealKey = (key: string, newProperty: string | undefined) =>
  buildNewKey(key, newProperty)
    .replace('properties/', 'properties.')
    .replace('items/', 'items.')

const getRawPropertyKey = (newPropertyKey: string | undefined) => {
  if (typeof newPropertyKey === 'undefined') {
    return ''
  }

  return newPropertyKey.replace('properties/', '').replace('items/', '')
}

export const getFlattenedSchemaFromParameters = (params: ParameterObject[]) => {
  if (typeof params === 'undefined') {
    return []
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let realKey = ''
  let displayKey = ''

  params.map((param: ParameterObject, topLevelIndex: number) => {
    let topLevelProps = {} as ParameterObject

    walkSchema(
      param.schema,
      param,
      wsState,
      (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
        // Top-level
        if (parent.schema === param.schema) {
          // We need to merge other top level keys here
          topLevelProps = cloneDeep(omit(parent, ['schema']))
          if (!topLevelProps.example) {
            topLevelProps.example = ''
          }

          realKey = `parameters[${topLevelIndex}].schema`
          displayKey = parent.name
        } else {
          realKey = parent['x-swagger-schema-flattener'].realPath
          displayKey = parent['x-swagger-schema-flattener'].displayPath
        }

        const newRealKey = buildRealKey(realKey, state.property)
        const newDisplayKey = buildNewKey(displayKey, state.property)
          .replace('properties/', '')
          .replace('items/', '')

        schema['x-swagger-schema-flattener'] = {
          realPath: newRealKey,
          displayPath: newDisplayKey,
          isTopLevel: false,
          depth: state.depth
        } as SwaggerSchemaFlattenerExtension

        // Add the required path on the actual param
        if (parent.required && Array.isArray(parent.required)) {
          if (parent.required.includes(getRawPropertyKey(state.property))) {
            schema['x-swagger-schema-flattener'].required = true
          }
        }

        // Deal with top level
        if (Object.keys(topLevelProps).length > 0) {
          schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps
          schema['x-swagger-schema-flattener'].isTopLevel = true
          // Copy the schema into the lower level
          schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
            realPath: newRealKey.replace('.schema', '')
          }
        }

        if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
          schema.example = ''
        }

        flattenedParams.push(schema)
      }
    )
  })

  return flattenedParams
}

// Deal with OAS 3 spec
export const getFlattenedSchemaFromRequestBody = (
  requestBody: RequestBodyObject,
  contentType: string
) => {
  if (typeof requestBody === 'undefined') {
    return []
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let realKey = ''
  let displayKey = ''

  let topLevelProps = {} as CustomRequestBodyObject

  walkSchema(
    requestBody.content[contentType].schema,
    requestBody,
    wsState,
    (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
      // Top-level
      if (parent.content && parent.content[contentType].schema) {
        // We need to merge other top level keys here
        topLevelProps = cloneDeep(omit(parent, ['content']))

        realKey = `requestBody.content['${contentType}'].schema`
        displayKey = 'requestBody'
      } else {
        topLevelProps = {}
        realKey = parent['x-swagger-schema-flattener'].realPath
        displayKey = parent['x-swagger-schema-flattener'].displayPath
      }

      const newRealKey = buildRealKey(realKey, state.property)
      const newDisplayKey = buildNewKey(displayKey, state.property)
        .replace('properties/', '')
        .replace('items/', '')

      schema['x-swagger-schema-flattener'] = {
        realPath: newRealKey,
        displayPath: newDisplayKey,
        isTopLevel: false,
        depth: state.depth
      } as SwaggerSchemaFlattenerExtension

      // Add the required path on the actual param
      if (parent.required && Array.isArray(parent.required)) {
        if (parent.required.includes(getRawPropertyKey(state.property))) {
          schema['x-swagger-schema-flattener'].required = true
        }
      }

      // Deal with top level
      if (Object.keys(topLevelProps).length > 0) {
        schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps
        schema['x-swagger-schema-flattener'].isTopLevel = true
        // Copy the schema into the lower level
        schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
          realPath: 'requestBody'
        }
      }

      if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
        schema.example = ''
      }

      flattenedParams.push(schema)
    }
  )

  return flattenedParams
}

export const getFlattenedSchemaFromResponses = (
  responses: ResponsesObject,
  contentType: string
) => {
  if (typeof responses === 'undefined') {
    return []
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedResponses = [] as SchemaObject[]
  let realKey = ''
  let displayKey = ''

  Object.keys(responses).map((responseKey: string, topLevelIndex: number) => {
    let currentDepth = 0
    // This can't be ResponseObject due to type error when reseting
    let topLevelProps = {} as any

    if (responses[responseKey].content) {
      walkSchema(
        responses[responseKey].content[contentType].schema,
        responses[responseKey],
        wsState,
        (schema: SchemaObject, parent: ResponseObject, state: WalkerState) => {
          // Top-level
          if (parent.content && parent.content[contentType].schema) {
            // We need to merge other top level keys here
            topLevelProps = cloneDeep(omit(parent, ['content']))

            realKey = `responses['${responseKey}'].content['${contentType}'].schema`
            displayKey = responseKey
          } else {
            topLevelProps = {}
            realKey = parent['x-swagger-schema-flattener'].realPath
            displayKey = parent['x-swagger-schema-flattener'].displayPath
          }

          const newRealKey = buildRealKey(realKey, state.property)
          const newDisplayKey = buildNewKey(displayKey, state.property)
            .replace('properties/', '')
            .replace('items/', '')

          schema['x-swagger-schema-flattener'] = {
            realPath: newRealKey,
            displayPath: newDisplayKey,
            isTopLevel: false,
            depth: state.depth
          } as SwaggerSchemaFlattenerExtension

          // Deal with top level
          if (Object.keys(topLevelProps).length > 0) {
            schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps
            schema['x-swagger-schema-flattener'].isTopLevel = true
            // Copy the schema into the lower level
            schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
              realPath: newRealKey.replace('.schema', '')
            }
          }

          if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
            schema.example = ''
          }

          currentDepth = state.depth

          flattenedResponses.push(schema)
        }
      )
    } else {
      const extension = {
        isTopLevel: true,
        displayPath: responseKey,
        realPath: `responses['${responseKey}']`,
        depth: 0
      } as SwaggerSchemaFlattenerExtension

      responses[responseKey]['x-swagger-schema-flattener'] = extension
      flattenedResponses.push(responses[responseKey])
    }
  })

  return flattenedResponses
}
