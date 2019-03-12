import { WalkerState } from './interfaces';
/**
 * functions to walk an OpenAPI schema object and traverse all subschemas
 * calling a callback function on each one
 */
/**
 * obtains the default starting state for the `state` object used
 * by walkSchema
 * @return the state object suitable for use in walkSchema
 */
export declare function getDefaultState(): WalkerState;
/**
 * begins the walk of a schema object, or the `state` object used
 * by walkSchema
 * @param parent the parent schema, if any. Use empty object if none
 * @param state the initial starting state of the walker, usually obtained from `getDefaultState`
 * @param callback, a function taking a schema, parent and state to be called on this and all subschemas
 * @return the schema object
 */
export declare function walkSchema(schema: any, parent: any, state: WalkerState, callback: any): any;
