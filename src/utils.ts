import at from 'lodash/at'
import { OpenAPIObject } from 'openapi3-ts'

import { IChangeset } from './interfaces'

// We get back undefined from oas-schema-walker, so need to deal with that
export const buildNewKey = (oldKey: string, newProperty: string | undefined): string => {
  return (oldKey += typeof newProperty === 'undefined' ? '' : `.${newProperty}`)
}

export const buildRealKey = (key: string, newProperty: string | undefined) =>
  buildNewKey(key, newProperty)
    .replace('properties/', 'properties.')
    .replace('items/', 'items.')

export const getPathFromRef = ($ref: string) => {
  if ($ref.includes('#')) {
    let $refStr = $ref.split('#').pop()

    if ($refStr) {
      $refStr = $refStr.replace(/\//g, '.').replace('.', '')
      return $refStr
    }
  }
}

export const getSchemaFromRef = ($ref: string, schema: OpenAPIObject) => {
  const refPath = getPathFromRef($ref)
  if (refPath) {
    return at(schema, [refPath])[0]
  }
}

export const isCyclic = (object: object) => {
  const keys = [] as string[]
  const stack = [] as object[]
  const stackSet = new Set()
  let detected = false

  function detect(obj: any, key: string) {
    if (obj && typeof obj !== 'object') {
      return
    }

    if (stackSet.has(obj)) {
      // it's cyclic! Print the object and its locations.
      const oldindex = stack.indexOf(obj)
      const l1 = keys.join('.') + '.' + key
      const l2 = keys.slice(0, oldindex + 1).join('.')
      console.log('CIRCULAR: ' + l1 + ' = ' + l2 + ' = ' + obj)
      console.log(obj)
      detected = true
      return
    }

    keys.push(key)
    stack.push(obj)
    stackSet.add(obj)
    for (const k in obj) {
      // dive on the object's children
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        detect(obj[k], k)
      }
    }

    keys.pop()
    stack.pop()
    stackSet.delete(obj)
    return
  }

  detect(object, 'obj')
  return detected
}

export const getChange = (changeset: IChangeset[], path: string) => {
  return changeset.find(change => change.path === path)
}
