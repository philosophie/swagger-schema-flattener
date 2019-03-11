import { SchemaObject } from 'openapi3-ts';
export interface WalkerState {
    depth: number;
    seen: WeakMap<SchemaObject, boolean>;
    top: boolean;
    combine: boolean;
    allowRefSiblings: boolean;
    property?: string;
}
