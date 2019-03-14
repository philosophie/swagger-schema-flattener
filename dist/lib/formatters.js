"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var walker_1 = require("./walker");
var lodash_es_1 = require("lodash-es");
var utils_1 = require("./utils");
var minimalSchema = function (schema) {
    var newSchema = lodash_es_1.omit(schema, ['properties', 'items', 'content', 'x-swagger-schema-flattener']);
    if (newSchema.enum) {
        newSchema.enum = newSchema.enum.join(', ');
    }
    return newSchema;
};
exports.getFormattedRequestBodySchema = function (requestBody, contentType) {
    if (typeof requestBody === 'undefined') {
        return {};
    }
    var wsState = walker_1.getDefaultState();
    wsState.combine = true;
    var formattedRequestBody = { requestBody: null };
    var displayKey = '';
    walker_1.walkSchema(requestBody.content[contentType].schema, requestBody, wsState, function (schema, parent, state) {
        if (parent.content && parent.content[contentType].schema) {
            displayKey = 'requestBody';
        }
        else {
            displayKey = parent['x-swagger-schema-flattener'].displayPath;
        }
        var newDisplayKey = utils_1.buildNewKey(displayKey, state.property)
            .replace('properties/', '')
            .replace('items/', '');
        schema['x-swagger-schema-flattener'] = {
            displayPath: newDisplayKey
        };
        if (parent.content && parent.content[contentType].schema) {
            lodash_es_1.set(formattedRequestBody, newDisplayKey, minimalSchema(parent));
        }
        else {
            lodash_es_1.set(formattedRequestBody, newDisplayKey, minimalSchema(schema));
        }
    });
    return formattedRequestBody;
};
exports.getFormattedResponseSchema = function (responses, contentType) {
    if (typeof responses === 'undefined') {
        return {};
    }
    var wsState = walker_1.getDefaultState();
    wsState.combine = true;
    return Object.keys(responses).map(function (responseKey) {
        var formattedResponse = {};
        var displayKey = '';
        if (responses[responseKey].content) {
            walker_1.walkSchema(responses[responseKey].content[contentType].schema, responses[responseKey], wsState, function (schema, parent, state) {
                if (parent.content && parent.content[contentType].schema) {
                    displayKey = responseKey;
                }
                else {
                    displayKey = parent['x-swagger-schema-flattener'].displayPath;
                }
                var newDisplayKey = utils_1.buildNewKey(displayKey, state.property)
                    .replace('properties/', '')
                    .replace('items/', '');
                schema['x-swagger-schema-flattener'] = {
                    displayPath: newDisplayKey
                };
                if (parent.content && parent.content[contentType].schema) {
                    lodash_es_1.set(formattedResponse, newDisplayKey, minimalSchema(parent));
                }
                else {
                    lodash_es_1.set(formattedResponse, newDisplayKey, minimalSchema(schema));
                }
            });
        }
        else {
            lodash_es_1.set(formattedResponse, responseKey, minimalSchema(responses[responseKey]));
        }
        // Reset the state for the next response!
        wsState = walker_1.getDefaultState();
        wsState.combine = true;
        return formattedResponse;
    });
};
//# sourceMappingURL=formatters.js.map