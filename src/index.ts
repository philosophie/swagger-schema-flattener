import { getDefaultState, walkSchema } from 'oas-schema-walker'
import { ParameterObject, SchemaObject } from 'openapi3-ts'

import { WalkerState } from './interfaces'

/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's paramPath in 'x-swagger-param-walker'.
 *
 * @param  {ParameterObject[]} params - Parameter object from de-refed spec
 * @return {SchemaObject[]}
 */
export function flattenParamSchema(params: ParameterObject[]): SchemaObject[] {
  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let parents = [] as ParameterObject[]
  let realKey = ''

  params.map((param: ParameterObject, topLevelIndex: number) => {
    let currentDepth = 0

    walkSchema(
      param.schema,
      param,
      wsState,
      (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
        // Going deeper
        if (currentDepth < state.depth) {
          parents.push(parent)
        } else if (currentDepth > state.depth) {
          // Going up
          parents = parents.slice(0, state.depth + 1)
        }

        // Top-level
        if (parent.schema === param.schema) {
          realKey = `parameters[${topLevelIndex}].schema`
        } else if (currentDepth < state.depth) {
          // Deeper level
          // If we've seen the parent offset the index by 0 otherwise, -1
          realKey = parent['x-swagger-param-walker'].realPath
        } else if (currentDepth > state.depth) {
          // Back up
          realKey = parent['x-swagger-param-walker'].realPath
        } else {
          // Same level?
          realKey = parent['x-swagger-param-walker'].realPath
        }

        const newRealKey = (realKey +=
          typeof state.property === 'undefined'
            ? ''
            : `.${state.property}`).replace('/', '.')

        schema['x-swagger-param-walker'] = {
          realPath: newRealKey,
        }

        currentDepth = state.depth

        flattenedParams.push(schema)
      },
    )
  })
  return flattenedParams
}
