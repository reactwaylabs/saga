import * as Immutable from "immutable";
import { Item } from "../abstractions/item";

export type Items<TItem> = Immutable.Map<string, Item<TItem>>;
