import { OpenAPIObject } from 'openapi3-ts';
import { IChangeset } from './interfaces';
export declare const buildNewKey: (oldKey: string, newProperty: string | undefined) => string;
export declare const buildRealKey: (key: string, newProperty: string | undefined) => string;
export declare const getPathFromRef: ($ref: string) => string | undefined;
export declare const getSchemaFromRef: ($ref: string, schema: OpenAPIObject) => any;
export declare const isCyclic: (object: object) => boolean;
export declare const getChange: (changeset: IChangeset[], path: string) => IChangeset | undefined;
