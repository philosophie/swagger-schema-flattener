import { ISchemaObject } from './schema-object';
export declare enum SchemaWalkerContextType {
    requestBody = "requestBody",
    parameters = "parameters",
    responses = "responses"
}
export interface ISchemaWalkerContext {
    type: SchemaWalkerContextType;
    topLevelKey?: string | number;
}
export interface ISchemaWalkerExt {
    path: string;
    key: string;
}
export interface ISpecWalkerOptions {
    context: ISchemaWalkerContext;
}
export interface ISpecWalkerMeta {
    title: string;
    key: string;
    schema: ISchemaObject;
}
