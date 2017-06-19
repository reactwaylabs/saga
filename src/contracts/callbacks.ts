import { ItemStatus } from "../abstractions/item-status";
export type OnSuccess<TValue> = (values: { [id: string]: TValue }) => void;
export type OnFailure = (values?: { [id: string]: ItemStatus } | string[]) => void;
