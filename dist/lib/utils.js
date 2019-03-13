"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// We get back undefined from oas-schema-walker, so need to deal with that
exports.buildNewKey = function (oldKey, newProperty) {
    return (oldKey += typeof newProperty === 'undefined' ? '' : "." + newProperty);
};
//# sourceMappingURL=utils.js.map