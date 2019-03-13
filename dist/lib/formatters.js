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
            lodash_es_1.set(formattedRequestBody, displayKey, minimalSchema(parent));
        }
        else {
            var newDisplayKey = utils_1.buildNewKey(displayKey, state.property)
                .replace('properties/', '')
                .replace('items/', '');
            schema['x-swagger-schema-flattener'] = {
                displayPath: newDisplayKey
            };
            lodash_es_1.set(formattedRequestBody, schema['x-swagger-schema-flattener'].displayPath, minimalSchema(schema));
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
                    lodash_es_1.set(formattedResponse, displayKey, minimalSchema(parent));
                }
                else {
                    var newDisplayKey = utils_1.buildNewKey(displayKey, state.property)
                        .replace('properties/', '')
                        .replace('items/', '');
                    schema['x-swagger-schema-flattener'] = {
                        displayPath: newDisplayKey
                    };
                    lodash_es_1.set(formattedResponse, schema['x-swagger-schema-flattener'].displayPath, minimalSchema(schema));
                }
            });
        }
        else {
            lodash_es_1.set(formattedResponse, responseKey, minimalSchema(responses[responseKey]));
        }
        return formattedResponse;
    });
};
//# sourceMappingURL=formatters.js.map