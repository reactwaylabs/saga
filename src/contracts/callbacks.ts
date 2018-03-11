import { ItemStatus } from "../abstractions/item-status";
import * as Immutable from "immutable";
export interface OnSuccess<TValue> {
    (values: { [id: string]: TValue } | Immutable.Collection.Keyed<string, TValue>): void;
}
export interface OnFailure {
    (values?: { [id: string]: ItemStatus } | Immutable.Collection.Keyed<string, ItemStatus> | string[]): void;
}
