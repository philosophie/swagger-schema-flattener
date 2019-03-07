import { ParameterObject } from 'openapi3-ts'

export interface SwaggerParamFlattenerExtension {
  realPath: string
  displayPath: string
  isTopLevel: boolean
  topLevelProps?: ParameterObject
}
