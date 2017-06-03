import * as Immutable from "immutable";
import { Item } from "./item";

/**
 * Type of items in map store state.
 */
export type Items<T> = Immutable.Map<string, Item<T>>;
