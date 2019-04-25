import { SchemaObject } from 'openapi3-ts';
import { ISpecWalkerMeta, ISpecWalkerOptions } from './interfaces';
export * from './utils';
export * from './constants';
export * from './interfaces';
export * from './enums';
export declare const walk: (schemaObj: SchemaObject, options: ISpecWalkerOptions) => ISpecWalkerMeta[];
