"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var at_1 = __importDefault(require("lodash/at"));
// We get back undefined from oas-schema-walker, so need to deal with that
exports.buildNewKey = function (oldKey, newProperty) {
    return (oldKey += typeof newProperty === 'undefined' ? '' : "." + newProperty);
};
exports.buildRealKey = function (key, newProperty) {
    return exports.buildNewKey(key, newProperty)
        .replace('properties/', 'properties.')
        .replace('items/', 'items.')
        .replace('allOf/', 'allOf')
        .replace('anyOf/', 'anyOf')
        .replace('oneOf/', 'oneOf');
};
var endsWith = function (checkString, matcher) {
    if (checkString) {
        var lastPart = checkString.split('.').pop();
        if (lastPart) {
            return lastPart.includes(matcher);
        }
    }
    return false;
};
exports.getFirstContentTypeFromContent = function (contentObj) {
    return Object.keys(contentObj)[0];
};
exports.getPathFromRef = function ($ref) {
    if ($ref.includes('#')) {
        var $refStr = $ref.split('#').pop();
        if ($refStr) {
            $refStr = $refStr.replace(/\//g, '.').replace('.', '');
            return $refStr;
        }
    }
};
exports.getSchemaFromRef = function ($ref, schema) {
    var refPath = exports.getPathFromRef($ref);
    if (refPath) {
        return at_1.default(schema, [refPath])[0];
    }
};
exports.isCyclic = function (object) {
    var keys = [];
    var stack = [];
    var stackSet = new Set();
    var detected = false;
    function detect(obj, key) {
        if (obj && typeof obj !== 'object') {
            return;
        }
        if (stackSet.has(obj)) {
            // it's cyclic! Print the object and its locations.
            var oldindex = stack.indexOf(obj);
            var l1 = keys.join('.') + '.' + key;
            var l2 = keys.slice(0, oldindex + 1).join('.');
            console.log('CIRCULAR: ' + l1 + ' = ' + l2 + ' = ' + obj);
            console.log(obj);
            detected = true;
            return;
        }
        keys.push(key);
        stack.push(obj);
        stackSet.add(obj);
        for (var k in obj) {
            // dive on the object's children
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                detect(obj[k], k);
            }
        }
        keys.pop();
        stack.pop();
        stackSet.delete(obj);
        return;
    }
    detect(object, 'obj');
    return detected;
};
exports.getChange = function (changeset, path) {
    return changeset.find(function (change) { return change.path === path; });
};
//# sourceMappingURL=utils.js.map