import { getDefaultState, walkSchema } from 'oas-schema-walker'
import { ParameterObject, SchemaObject } from 'openapi3-ts'

import { WalkerState } from './interfaces'

export default function schemaToFlatParams(
  params: ParameterObject[],
): SchemaObject[] {
  let wsState = getDefaultState() as WalkerState
  wsState.combine = true

  const flattenedParams = [] as SchemaObject[]
  let currentDepth = 0
  let currentPath = ''
  let parents = [] as ParameterObject[]

  params.map((param: ParameterObject) => {
    walkSchema(
      param.schema,
      param,
      wsState,
      (schema: SchemaObject, parent: ParameterObject, state: WalkerState) => {
        if (currentDepth < state.depth) {
          // Going deeper
          parents.push(parent)
        } else if (currentDepth > state.depth) {
          // Going up
          parents = parents.slice(0, state.depth + 1)
        }

        let parentKey

        if (parent.type === 'object' && parent.properties) {
          if (parent.properties) {
            parentKey = Object.entries(parent.properties).find(
              kv => kv[1] === schema,
            )[0]
          } else {
            throw 'Parent of object type found with undefined parameters!'
          }
        } else if (parent.type === 'array') {
          if (parents[state.depth - 2].properties) {
            parentKey = Object.entries(
              parents[state.depth - 2].properties,
            ).find(kv => {
              const item = kv[1] as SchemaObject
              return item.type === 'array' && item.items === schema
            })[0]
          } else {
            throw "Parent's parent of array type found with undefined parameters!"
          }
        } else if (parent.schema === param.schema) {
          // Top-level
          parentKey = param.name
        } else {
          throw 'Figure this case out...'
        }

        if (currentDepth < state.depth) {
          // Going deeper
          currentPath += `.${parentKey}`
        } else {
          // Same level
          currentPath = currentPath
            .split('.')
            .slice(0, state.depth + 1)
            .join('.')
          currentPath += `.${parentKey}`
        }

        currentDepth = state.depth

        schema['x-swagger-param-walker'] = {
          paramPath: currentPath.substring(1),
        }

        flattenedParams.push(schema)
      },
    )
  })
  return flattenedParams
}
