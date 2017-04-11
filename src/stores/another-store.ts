import * as Flux from "flux";
import { ReduceStore as FluxReduceStore } from "flux/utils";
import * as Immutable from "immutable";
import { Dispatcher, DispatcherMessage, DispatcherBuilder } from "../dispatcher";
export type ActionHandler<TClass, TState> = (action: TClass, state: TState) => TState | void;
export type StoreWillCleanup<TState> = () => void | TState;

