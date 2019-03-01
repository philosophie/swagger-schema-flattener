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
  let currentDepth = 0
  let currentPath = ''
  let realPath = ''
  let parents = [] as ParameterObject[]

  params.map((param: ParameterObject, topLevelIndex: number) => {
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
        let realKey
        let realDepthObjectOffset = 1
        let realDepthArrayOffset = 0

        if (parent.type === 'object' && parent.properties) {
          if (parent.properties) {
            parentKey = Object.entries(parent.properties).find(
              kv => kv[1] === schema,
            )[0]
            realKey = `properties.${parentKey}`
            realDepthObjectOffset++
          } else {
            throw 'Parent of object type found with undefined parameters!'
          }
        } else if (parent.type === 'array') {
          if (parents[state.depth - 2].properties) {
            parentKey = Object.entries(
              parents[state.depth - 2].properties,
            ).find((kv, index: number) => {
              const item = kv[1] as SchemaObject
              return item.type === 'array' && item.items === schema
            })[0]
            realKey = 'items'
            realDepthArrayOffset++
          } else {
            throw "Parent's parent of array type found with undefined parameters!"
          }
        } else if (parent.schema === param.schema) {
          // Top-level
          parentKey = param.name
          realKey = `parameters[${topLevelIndex}].schema`
        } else {
          throw 'Figure this case out...'
        }

        if (realKey === 'items') {
          debugger
        }

        if (currentDepth < state.depth) {
          // Going deeper
          currentPath += currentPath.length === 0 ? parentKey : `.${parentKey}`
          realPath += realPath.length === 0 ? realKey : `.${realKey}`
        } else if (currentDepth > state.depth) {
          // Going back up
          // const parentIndex =
          //   state.depth * realDepthObjectOffset -
          //   realDepthArrayOffset -
          //   state.depth

          const parentParamPath =
            parents[parents.length - 1]['x-swagger-param-walker'].paramPath
          const parentRealPath =
            parents[parents.length - 1]['x-swagger-param-walker'].realPath

          currentPath = `${parentParamPath}.${parentKey}`
          realPath = `${parentRealPath}.${realKey}`
        }

        // Same level
        const currentPathArr = currentPath.split('.')
        const realPathArr = realPath.split('.')

        currentPath = currentPathArr.slice(0, state.depth + 1).join('.')
        currentPath += currentPath.length === 0 ? parentKey : `.${parentKey}`
        const sliceDepth =
          state.depth * realDepthObjectOffset - realDepthArrayOffset

        if (realPath.includes('.socialNetworks')) {
          debugger
        }

        realPath = realPathArr.slice(0, sliceDepth).join('.')
        realPath += realPath.length === 0 ? realKey : `.${realKey}`

        console.log(
          realPath,
          state.depth * realDepthObjectOffset - realDepthArrayOffset,
        )

        currentDepth = state.depth

        schema['x-swagger-param-walker'] = {
          paramPath: currentPath,
          realPath: realPath,
        }

        flattenedParams.push(schema)
      },
    )
  })
  return flattenedParams
}

// NOTE: we can merge objects at the top for edit,
//       for removal, we can find the object we need

const paramFromStringifiedKey = (schema: ParameterObject[], str: string) => {
  str = str.replace(/\[(\w+)\]/g, '.$1')
  str = str.replace(/^\./, '')
  let parts = str.split('.')

  // Handle nested param
  if (parts.length > 1) {
    let topLevelParam = schema.find((p: ParameterObject) => p.name === parts[0])
    parts.shift()

    // debugger
    for (let i = 0, n = parts.length; i < n; ++i) {
      const k = parts[i]
      if (k in topLevelParam) {
        topLevelParam = topLevelParam[k]
      } else {
        return
      }
    }
    // debugger
    return topLevelParam
  }
}

export function findParamFromStringifiedPath(
  schema: ParameterObject[],
  paramPath: string,
) {
  // const parts = paramPath.split('.')

  console.log(paramFromStringifiedKey(schema, paramPath))

  // parts.map((part: string) => {
  //   objFromStringifiedKey()
  // })
}
