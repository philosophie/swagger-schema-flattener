import { ParameterObject, RequestBodyObject, ResponsesObject, SchemaObject } from 'openapi3-ts';
export declare const getFlattenedSchemaFromParameters: (params: ParameterObject[]) => SchemaObject[];
export declare const getFlattenedSchemaFromRequestBody: (requestBody: RequestBodyObject, contentType: string) => SchemaObject[];
export declare const getFlattenedSchemaFromResponses: (responses: ResponsesObject, contentType: string) => SchemaObject[];
