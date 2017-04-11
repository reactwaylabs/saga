import * as Immutable from "immutable";
import { Item } from "../abstractions/item";

export type Items<T> = Immutable.Map<string, Item<T>>;
