import { getDefaultState, walkSchema } from 'oas-schema-walker'
import { OperationObject, ParameterObject, RequestBodyObject, SchemaObject } from 'openapi3-ts'
import { cloneDeep, omit } from 'lodash-es'

import { SwaggerParamFlattenerExtension, WalkerState, CustomRequestBodyObject } from './interfaces'

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

const getFlattenedSchemaFromParameters = (params: ParameterObject[]) => {
  if (typeof params === 'undefined') {
    return []
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let realKey = ''
  let displayKey = ''

  params.map((param: ParameterObject, topLevelIndex: number) => {
    let currentDepth = 0
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
          realKey = parent['x-swagger-param-flattener'].realPath
          displayKey = parent['x-swagger-param-flattener'].displayPath
        }

        const newRealKey = buildRealKey(realKey, state.property)
        const newDisplayKey = buildNewKey(displayKey, state.property)
          .replace('properties/', '')
          .replace('items/', '')

        schema['x-swagger-param-flattener'] = {
          realPath: newRealKey,
          displayPath: newDisplayKey,
          isTopLevel: false
        } as SwaggerParamFlattenerExtension

        // Add the required path on the actual param
        if (parent.required && Array.isArray(parent.required)) {
          if (parent.required.includes(getRawPropertyKey(state.property))) {
            schema['x-swagger-param-flattener'].required = true
          }
        }

        // Deal with top level
        if (Object.keys(topLevelProps).length > 0) {
          schema['x-swagger-param-flattener'].topLevelProps = topLevelProps
          schema['x-swagger-param-flattener'].isTopLevel = true
          // Copy the schema into the lower level
          schema['x-swagger-param-flattener'].topLevelProps['x-swagger-param-flattener'] = {
            realPath: newRealKey.replace('.schema', '')
          }
        }

        if (!schema.example) {
          schema.example = ''
        }

        currentDepth = state.depth

        flattenedParams.push(schema)
      }
    )
  })

  return flattenedParams
}

// Deal with OAS 3 spec
const getFlattenedSchemaFromRequestBody = (requestBody: RequestBodyObject, contentType: string) => {
  if (typeof requestBody === 'undefined') {
    return []
  }

  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let realKey = ''
  let displayKey = ''

  let currentDepth = 0
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
        if (!topLevelProps.example) {
          topLevelProps.example = ''
        }

        realKey = `requestBody.content['${contentType}'].schema`
        displayKey = 'requestBody'
      } else {
        topLevelProps = {}
        realKey = parent['x-swagger-param-flattener'].realPath
        displayKey = parent['x-swagger-param-flattener'].displayPath
      }

      const newRealKey = buildRealKey(realKey, state.property)
      const newDisplayKey = buildNewKey(displayKey, state.property)
        .replace('properties/', '')
        .replace('items/', '')

      schema['x-swagger-param-flattener'] = {
        realPath: newRealKey,
        displayPath: newDisplayKey,
        isTopLevel: false
      } as SwaggerParamFlattenerExtension

      // Add the required path on the actual param
      if (parent.required && Array.isArray(parent.required)) {
        if (parent.required.includes(getRawPropertyKey(state.property))) {
          schema['x-swagger-param-flattener'].required = true
        }
      }

      // Deal with top level
      if (Object.keys(topLevelProps).length > 0) {
        schema['x-swagger-param-flattener'].topLevelProps = topLevelProps
        schema['x-swagger-param-flattener'].isTopLevel = true
        // Copy the schema into the lower level
        schema['x-swagger-param-flattener'].topLevelProps['x-swagger-param-flattener'] = {
          realPath: 'requestBody'
        }
      }

      if (!schema.example) {
        schema.example = ''
      }

      currentDepth = state.depth

      flattenedParams.push(schema)
    }
  )

  return flattenedParams
}

/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-param-flattener'.
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
 *              Tracks each param's path in 'x-swagger-param-flattener'.
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
