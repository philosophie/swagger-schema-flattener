import { ParameterObject, ISpecificationExtension } from 'openapi3-ts';
export interface CustomRequestBodyObject extends ISpecificationExtension {
    description?: string;
    required?: boolean;
}
export interface SwaggerParamFlattenerExtension {
    realPath: string;
    displayPath: string;
    isTopLevel: boolean;
    topLevelProps?: ParameterObject;
}
