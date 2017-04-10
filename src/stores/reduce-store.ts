import * as Flux from "flux";
import { ReduceStore as FluxReduceStore } from "flux/utils";
import * as Immutable from "immutable";
import { Dispatcher, DispatcherMessage } from "../dispatcher";


export type ActionHandler<TClass, TState> = (action: TClass, state: TState) => TState | void;


export abstract class ReduceStore<TState> extends FluxReduceStore<TState, DispatcherMessage<any>> {
    /**
     * Creates an instance of ReduceStore.
     *
     * @param dispatcher {Flux.Dispatcher<DispatcherMessage<any>>} Dispatcher instance.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher || Dispatcher);
    }

    private actionHandlers = Immutable.Map<Function, ActionHandler<any, TState>>();


    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     *
     */
    abstract getInitialState(): TState;


    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state {TState} Current store state.
     * @param payload {DispatcherMessage<any>} Disaptched payload message.
     */
    reduce(state: TState, payload: DispatcherMessage<any>): TState {
        this.actionHandlers.forEach((handler: ActionHandler<Function, TState>, action: Function) => {
            if (payload.action instanceof action && this.shouldHandleAction(payload.action, state)) {
                let newState = handler(payload.action, state);
                if (newState != null) {
                    state = newState;
                }
            }
        });
        return state;
    }


    /**
     * Checks if two versions of state are the same.
     * You do not need to override.
     *
     * @param startingState {TState} Starting state (current)
     * @param endingState {TState} Ending state (updated)
     */
    areEqual(startingState: TState, endingState: TState): boolean {
        if (startingState != null &&
            endingState != null &&
            typeof startingState === "object" &&
            !Immutable.Iterable.isIterable(startingState)) {

            let keys = Object.keys(startingState);
            if (keys.length === 0) {
                return startingState === endingState;
            }
            let areEqual = true;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if ((startingState as { [key: string]: any })[key] !== (endingState as { [key: string]: any })[key]) {
                    areEqual = false;
                    break;
                }
            }
            return areEqual;
        } else {
            return startingState === endingState;
        }
    }


    /**
     * Check if action should handled.
     * By default always return true.
     *
     * @param action {Object} Action payload data.
     * @param state {TState} Updated store state.
     */
    protected shouldHandleAction(action: Object, state: TState): boolean {
        return true;
    }


    /**
     * Register specified action handler in this store.
     *
     * @param action {Function} Action class function.
     * @param handler {ActionHandler<TClass, TState>} Action handler function.
     */
    protected registerAction<TClass>(action: Function, handler: ActionHandler<TClass, TState>): void {
        if (action != null) {
            this.actionHandlers = this.actionHandlers.set(action, handler);
        } else {
            throw new Error(`SimplrFlux.ReduceStore.registerAction() [${this.constructor.name}]: ` +
                `cannot register action of '${action}'.`);
        }
    }
}
