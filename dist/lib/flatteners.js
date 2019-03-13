"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var walker_1 = require("./walker");
var lodash_es_1 = require("lodash-es");
// We get back undefined from oas-schema-walker, so need to deal with that
var buildNewKey = function (oldKey, newProperty) {
    return (oldKey += typeof newProperty === 'undefined' ? '' : "." + newProperty);
};
var buildRealKey = function (key, newProperty) {
    return buildNewKey(key, newProperty)
        .replace('properties/', 'properties.')
        .replace('items/', 'items.');
};
var getRawPropertyKey = function (newPropertyKey) {
    if (typeof newPropertyKey === 'undefined') {
        return '';
    }
    return newPropertyKey.replace('properties/', '').replace('items/', '');
};
exports.getFlattenedSchemaFromParameters = function (params) {
    if (typeof params === 'undefined') {
        return [];
    }
    var wsState = walker_1.getDefaultState();
    wsState.combine = true;
    var flattenedParams = [];
    var realKey = '';
    var displayKey = '';
    params.map(function (param, topLevelIndex) {
        var topLevelProps = {};
        walker_1.walkSchema(param.schema, param, wsState, function (schema, parent, state) {
            // Top-level
            if (parent.schema === param.schema) {
                // We need to merge other top level keys here
                topLevelProps = lodash_es_1.cloneDeep(lodash_es_1.omit(parent, ['schema']));
                if (!topLevelProps.example) {
                    topLevelProps.example = '';
                }
                realKey = "parameters[" + topLevelIndex + "].schema";
                displayKey = parent.name;
            }
            else {
                realKey = parent['x-swagger-schema-flattener'].realPath;
                displayKey = parent['x-swagger-schema-flattener'].displayPath;
            }
            var newRealKey = buildRealKey(realKey, state.property);
            var newDisplayKey = buildNewKey(displayKey, state.property)
                .replace('properties/', '')
                .replace('items/', '');
            schema['x-swagger-schema-flattener'] = {
                realPath: newRealKey,
                displayPath: newDisplayKey,
                isTopLevel: false,
                depth: state.depth
            };
            // Add the required path on the actual param
            if (parent.required && Array.isArray(parent.required)) {
                if (parent.required.includes(getRawPropertyKey(state.property))) {
                    schema['x-swagger-schema-flattener'].required = true;
                }
            }
            // Deal with top level
            if (Object.keys(topLevelProps).length > 0) {
                schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps;
                schema['x-swagger-schema-flattener'].isTopLevel = true;
                // Copy the schema into the lower level
                schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
                    realPath: newRealKey.replace('.schema', '')
                };
            }
            if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
                schema.example = '';
            }
            flattenedParams.push(schema);
        });
    });
    return flattenedParams;
};
// Deal with OAS 3 spec
exports.getFlattenedSchemaFromRequestBody = function (requestBody, contentType) {
    if (typeof requestBody === 'undefined') {
        return [];
    }
    var wsState = walker_1.getDefaultState();
    wsState.combine = true;
    var flattenedParams = [];
    var realKey = '';
    var displayKey = '';
    var topLevelProps = {};
    walker_1.walkSchema(requestBody.content[contentType].schema, requestBody, wsState, function (schema, parent, state) {
        // Top-level
        if (parent.content && parent.content[contentType].schema) {
            // We need to merge other top level keys here
            topLevelProps = lodash_es_1.cloneDeep(lodash_es_1.omit(parent, ['content']));
            realKey = "requestBody.content['" + contentType + "'].schema";
            displayKey = 'requestBody';
        }
        else {
            topLevelProps = {};
            realKey = parent['x-swagger-schema-flattener'].realPath;
            displayKey = parent['x-swagger-schema-flattener'].displayPath;
        }
        var newRealKey = buildRealKey(realKey, state.property);
        var newDisplayKey = buildNewKey(displayKey, state.property)
            .replace('properties/', '')
            .replace('items/', '');
        schema['x-swagger-schema-flattener'] = {
            realPath: newRealKey,
            displayPath: newDisplayKey,
            isTopLevel: false,
            depth: state.depth
        };
        // Add the required path on the actual param
        if (parent.required && Array.isArray(parent.required)) {
            if (parent.required.includes(getRawPropertyKey(state.property))) {
                schema['x-swagger-schema-flattener'].required = true;
            }
        }
        // Deal with top level
        if (Object.keys(topLevelProps).length > 0) {
            schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps;
            schema['x-swagger-schema-flattener'].isTopLevel = true;
            // Copy the schema into the lower level
            schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
                realPath: 'requestBody'
            };
        }
        if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
            schema.example = '';
        }
        flattenedParams.push(schema);
    });
    return flattenedParams;
};
exports.getFlattenedSchemaFromResponses = function (responses, contentType) {
    if (typeof responses === 'undefined') {
        return [];
    }
    var wsState = walker_1.getDefaultState();
    wsState.combine = true;
    var flattenedResponses = [];
    var realKey = '';
    var displayKey = '';
    Object.keys(responses).map(function (responseKey, topLevelIndex) {
        var currentDepth = 0;
        // This can't be ResponseObject due to type error when reseting
        var topLevelProps = {};
        if (responses[responseKey].content) {
            walker_1.walkSchema(responses[responseKey].content[contentType].schema, responses[responseKey], wsState, function (schema, parent, state) {
                // Top-level
                if (parent.content && parent.content[contentType].schema) {
                    // We need to merge other top level keys here
                    topLevelProps = lodash_es_1.cloneDeep(lodash_es_1.omit(parent, ['content']));
                    realKey = "responses['" + responseKey + "'].content['" + contentType + "'].schema";
                    displayKey = responseKey;
                }
                else {
                    topLevelProps = {};
                    realKey = parent['x-swagger-schema-flattener'].realPath;
                    displayKey = parent['x-swagger-schema-flattener'].displayPath;
                }
                var newRealKey = buildRealKey(realKey, state.property);
                var newDisplayKey = buildNewKey(displayKey, state.property)
                    .replace('properties/', '')
                    .replace('items/', '');
                schema['x-swagger-schema-flattener'] = {
                    realPath: newRealKey,
                    displayPath: newDisplayKey,
                    isTopLevel: false,
                    depth: state.depth
                };
                // Deal with top level
                if (Object.keys(topLevelProps).length > 0) {
                    schema['x-swagger-schema-flattener'].topLevelProps = topLevelProps;
                    schema['x-swagger-schema-flattener'].isTopLevel = true;
                    // Copy the schema into the lower level
                    schema['x-swagger-schema-flattener'].topLevelProps['x-swagger-schema-flattener'] = {
                        realPath: newRealKey.replace('.schema', '')
                    };
                }
                if (!schema.example && !(schema.type === 'object' || schema.type === 'array')) {
                    schema.example = '';
                }
                currentDepth = state.depth;
                flattenedResponses.push(schema);
            });
        }
        else {
            var extension = {
                isTopLevel: true,
                displayPath: responseKey,
                realPath: "responses['" + responseKey + "']",
                depth: 0
            };
            responses[responseKey]['x-swagger-schema-flattener'] = extension;
            flattenedResponses.push(responses[responseKey]);
        }
    });
    return flattenedResponses;
};
//# sourceMappingURL=flatteners.js.map