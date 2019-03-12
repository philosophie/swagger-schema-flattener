import { OperationObject, SchemaObject } from 'openapi3-ts';
/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @return {SchemaObject[]}
 */
export declare function flattenParamSchema(operation: OperationObject): SchemaObject[];
/**
 * @description Converts the requestBody object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export declare function flattenRequestBodySchema(operation: OperationObject, contentType?: string): SchemaObject[];
/**
 * @description Converts the responses object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export declare function flattenResponseSchema(operation: OperationObject, contentType?: string): SchemaObject[];
/**
 * @description Converts the responses object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
export declare function formatRequestBody(operation: OperationObject, contentType?: string): any;
