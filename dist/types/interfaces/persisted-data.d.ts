import { IChangeset } from './changeset';
import { IOperationMethod } from './operation-method';
export interface IPersistedData {
    specId: string;
    endpoint: string;
    method: IOperationMethod;
    changes: IChangeset[];
}
