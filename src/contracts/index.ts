import * as Immutable from "immutable";
import { Item } from "../abstractions/item";

export interface RequestDataHandlerResult<TItem> {
    [id: string]: TItem | null;
}
export interface RequestDataHandler<TItem> {
    (ids: string[]): Promise<RequestDataHandlerResult<TItem>>;
}

export type Items<TItem> = Immutable.Map<string, Item<TItem>>;
