import { getDefaultState, walkSchema } from 'oas-schema-walker'
import { ParameterObject, SchemaObject } from 'openapi3-ts'

import { SwaggerParamFlattenerExtension, WalkerState } from './interfaces'

// We get back undefined from oas-schema-walker, so need to deal with that
const buildNewKey = (oldKey: string, newProperty: string | undefined): string => {
  return (oldKey += typeof newProperty === 'undefined' ? '' : `.${newProperty}`)
}

/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-param-flattener'.
 *
 * @param  {ParameterObject[]} params - Parameter object from de-refed spec
 * @return {SchemaObject[]}
 */
export function flattenParamSchema(params: ParameterObject[]): SchemaObject[] {
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
    let topLevelProps = {} as SchemaObject

    walkSchema(
      param.schema,
      param,
      wsState,
      (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
        // Top-level
        if (parent.schema === param.schema) {
          // We need to merge other top level keys here
          topLevelProps = Object.assign(topLevelProps, parent)
          delete topLevelProps.schema

          realKey = `parameters[${topLevelIndex}].schema`
          displayKey = parent.name
        } else {
          realKey = parent['x-swagger-param-flattener'].realPath
          displayKey = parent['x-swagger-param-flattener'].displayPath
        }

        const newRealKey = buildNewKey(realKey, state.property).replace('/', '.')

        const newDisplayKey = buildNewKey(displayKey, state.property)
          .replace('properties/', '')
          .replace('items/', '')

        schema['x-swagger-param-flattener'] = {
          realPath: newRealKey,
          displayPath: newDisplayKey,
          isTopLevel: false
        } as SwaggerParamFlattenerExtension

        if (Object.keys(topLevelProps).length > 0) {
          schema['x-swagger-param-flattener'].topLevelProps = topLevelProps
          schema['x-swagger-param-flattener'].isTopLevel = true
        }

        currentDepth = state.depth

        flattenedParams.push(schema)
      }
    )
  })
  return flattenedParams
}
