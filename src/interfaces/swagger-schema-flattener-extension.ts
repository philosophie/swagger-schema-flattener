import { ParameterObject, ISpecificationExtension } from 'openapi3-ts'

export interface CustomRequestBodyObject extends ISpecificationExtension {
  description?: string
  required?: boolean
}

export interface SwaggerSchemaFlattenerExtension {
  realPath: string
  displayPath: string
  isTopLevel: boolean
  depth: number
  topLevelProps?: ParameterObject
}
