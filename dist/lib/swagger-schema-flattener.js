"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var flatteners_1 = require("./flatteners");
var formatters_1 = require("./formatters");
/**
 * @description Converts the parameters object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @return {SchemaObject[]}
 */
function flattenParamSchema(operation) {
    return flatteners_1.getFlattenedSchemaFromParameters(operation.parameters);
}
exports.flattenParamSchema = flattenParamSchema;
/**
 * @description Converts the requestBody object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
function flattenRequestBodySchema(operation, contentType) {
    if (contentType === void 0) { contentType = 'application/json'; }
    return flatteners_1.getFlattenedSchemaFromRequestBody(operation.requestBody, contentType);
}
exports.flattenRequestBodySchema = flattenRequestBodySchema;
/**
 * @description Converts the responses object from dereferenced
 *              endpoint's method into a flattened array of params.
 *              Tracks each param's path in 'x-swagger-schema-flattener'.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
function flattenResponseSchema(operation, contentType) {
    if (contentType === void 0) { contentType = 'application/json'; }
    return flatteners_1.getFlattenedSchemaFromResponses(operation.responses, contentType);
}
exports.flattenResponseSchema = flattenResponseSchema;
/**
 * @description Converts a flattened Request Body object from dereferenced
 *              endpoint's method into a formatted object of params.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
function formatRequestBody(operation, contentType) {
    if (contentType === void 0) { contentType = 'application/json'; }
    return formatters_1.getFormattedRequestBodySchema(operation.requestBody, contentType);
}
exports.formatRequestBody = formatRequestBody;
/**
 * @description Converts a flattened Request Body object from dereferenced
 *              endpoint's method into a formatted object of params.
 *
 * @param  {OperationObject[]} params - Operation object from de-refed spec
 * @param  {contentType[]} params -  Current content type, defaults to application/json
 * @return {SchemaObject[]}
 */
function formatResponses(operation, contentType) {
    if (contentType === void 0) { contentType = 'application/json'; }
    return formatters_1.getFormattedResponseSchema(operation.responses, contentType);
}
exports.formatResponses = formatResponses;
//# sourceMappingURL=swagger-schema-flattener.js.map