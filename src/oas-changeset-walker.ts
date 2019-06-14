import { SchemaObject } from 'openapi3-ts'

import { OASWalkerConstants } from './constants'
import { buildRealKey } from './utils'
import {
  ISchemaObject,
  ISpecWalkerMeta,
  ISpecWalkerOptions,
  IWalkerState,
  SchemaWalkerContextType
} from './interfaces'

export * from './constants'
export * from './utils'
export * from './interfaces'
export * from './enums'

export const walk = (schemaObj: SchemaObject, contentType: string, options: ISpecWalkerOptions) => {
  const schemas = [] as ISpecWalkerMeta[]
  let firstPathKey = ''
  let pathKey = ''

  if (options.context.type === SchemaWalkerContextType.requestBody) {
    firstPathKey = `requestBody.content['${contentType}'].schema`
  } else if (
    options.context.type === SchemaWalkerContextType.responses &&
    options.context.topLevelKey
  ) {
    firstPathKey = `responses['${options.context.topLevelKey}'].content['${contentType}'].schema`
  } else if (
    options.context.type === SchemaWalkerContextType.parameters &&
    options.context.topLevelKey
  ) {
    firstPathKey = `parameters[${options.context.topLevelKey}].schema`
  } else {
    return []
  }

  walkSchema(schemaObj, {}, getDefaultState(), (schema, parent, walkerState) => {
    // First set pathKey
    if (schema[OASWalkerConstants.X_SCHEMA_WALKER]) {
      pathKey = schema[OASWalkerConstants.X_SCHEMA_WALKER].path
    } else if (Object.keys(parent).length === 0 && walkerState.depth === 0) {
      pathKey = firstPathKey
    } else {
      pathKey = parent[OASWalkerConstants.X_SCHEMA_WALKER].path
    }

    const newKey = buildRealKey(pathKey, walkerState.property)

    schema[OASWalkerConstants.X_SCHEMA_WALKER] = {
      key: schema.$ref ? OASWalkerConstants.X_SCHEMA_WALKER_PATH_PREFIX + newKey : newKey,
      path: newKey
    }

    const title = walkerState.property
      ? walkerState.property
          .replace('properties/', '')
          .replace('items/', '')
          .replace('allOf/', '')
          .replace('anyOf/', '')
          .replace('oneOf/', '')
      : ''

    schemas.push({
      key: schema[OASWalkerConstants.X_SCHEMA_WALKER].path,
      schema: schema as ISchemaObject,
      title
    })
  })

  return schemas
}

/**
 * obtains the default starting state for the `state` object used
 * by walkSchema
 * @return the state object suitable for use in walkSchema
 */
function getDefaultState(): IWalkerState {
  return {
    combine: true,
    depth: 0,
    seen: new WeakMap(),
    top: true
  }
}

/**
 * begins the walk of a schema object, or the `state` object used
 * by walkSchema
 * @param parent the parent schema, if any. Use empty object if none
 * @param state the initial starting state of the walker, usually obtained from `getDefaultState`
 * @param callback, a function taking a schema, parent and state to be called on this and all subschemas
 * @return the schema object
 */
function walkSchema(
  schema: SchemaObject,
  parent: SchemaObject,
  state: IWalkerState,
  callback: (schema: SchemaObject, parent: SchemaObject, state: IWalkerState) => void
) {
  if (typeof state.depth === 'undefined') {
    state = getDefaultState()
  }
  if (schema === null || typeof schema === 'undefined') {
    return schema
  }
  if (typeof schema.$ref !== 'undefined') {
    // let temp = { $ref: schema.$ref }
    // if (state.allowRefSiblings && schema.description) {
    //   temp.description = schema.description
    // }
    callback(schema, parent, state)
    return schema // all other properties SHALL be ignored
  }

  if (state.combine) {
    if (schema.allOf && Array.isArray(schema.allOf) && schema.allOf.length === 1) {
      schema = Object.assign({}, schema.allOf[0], schema)
      delete schema.allOf
    }
    if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length === 1) {
      schema = Object.assign({}, schema.anyOf[0], schema)
      delete schema.anyOf
    }
    if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length === 1) {
      schema = Object.assign({}, schema.oneOf[0], schema)
      delete schema.oneOf
    }
  }

  callback(schema, parent, state)
  if (state.seen.has(schema)) {
    return schema
  }

  if (typeof schema === 'object' && schema !== null) {
    state.seen.set(schema, true)
  }

  state.top = false
  state.depth++

  if (typeof schema.items !== 'undefined') {
    state.property = 'items'
    walkSchema(schema.items, schema, state, callback)
  }
  if (schema.additionalItems) {
    if (typeof schema.additionalItems === 'object') {
      state.property = 'additionalItems'
      walkSchema(schema.additionalItems, schema, state, callback)
    }
  }
  if (schema.additionalProperties) {
    if (typeof schema.additionalProperties === 'object') {
      state.property = 'additionalProperties'
      walkSchema(schema.additionalProperties, schema, state, callback)
    }
  }
  if (schema.properties) {
    for (let prop in schema.properties) {
      let subSchema = schema.properties[prop]
      state.property = 'properties/' + prop
      walkSchema(subSchema, schema, state, callback)
    }
  }
  if (schema.patternProperties) {
    for (let prop in schema.patternProperties) {
      let subSchema = schema.patternProperties[prop]
      state.property = 'patternProperties/' + prop
      walkSchema(subSchema, schema, state, callback)
    }
  }
  if (schema.allOf) {
    for (let index in schema.allOf) {
      let subSchema = schema.allOf[index]
      state.property = 'allOf/' + '[' + index + ']'
      walkSchema(subSchema, schema, state, callback)
    }
  }
  if (schema.anyOf) {
    for (let index in schema.anyOf) {
      let subSchema = schema.anyOf[index]
      state.property = 'anyOf/' + '[' + index + ']'
      walkSchema(subSchema, schema, state, callback)
    }
  }
  if (schema.oneOf) {
    for (let index in schema.oneOf) {
      let subSchema = schema.oneOf[index]
      state.property = 'oneOf/' + '[' + index + ']'
      walkSchema(subSchema, schema, state, callback)
    }
  }
  if (schema.not) {
    state.property = 'not'
    walkSchema(schema.not, schema, state, callback)
  }
  state.depth--
  return schema
}
