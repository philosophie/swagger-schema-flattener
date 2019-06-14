import { SchemaObject } from 'openapi3-ts';
import { ISpecWalkerMeta, ISpecWalkerOptions } from './interfaces';
export * from './constants';
export * from './utils';
export * from './interfaces';
export * from './enums';
export declare const walk: (schemaObj: SchemaObject, contentType: string, options: ISpecWalkerOptions) => ISpecWalkerMeta[];
