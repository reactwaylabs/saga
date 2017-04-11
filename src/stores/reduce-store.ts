import * as Flux from "flux";
import { ReduceStore as FluxReduceStore } from "flux/utils";
import * as Immutable from "immutable";
import { Dispatcher, DispatcherMessage, DispatcherBuilder } from "../dispatcher";

export type ActionHandler<TClass, TMyState> = (action: TClass, state: TMyState) => TMyState | void;
export type StoreWillCleanup<TMyState> = () => void | TMyState;

export abstract class ReduceStore<TState2> extends FluxReduceStore<TState2, DispatcherMessage<any>> {
    /**
     * Creates an instance of ReduceStore.
     *
     * @param {Flux.Dispatcher<DispatcherMessage<any>>} [dispatcher] - Dispatcher instance.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher || Dispatcher);
        this.startNewSession();
    }
    /**
     * Actions handlers list.
     *
     */
    private actionsHandlers = Immutable.Map<Function, ActionHandler<any, TState2>>();
    /**
     * Is store in clean up state.
     *
     */
    private inCleanUpState: boolean;
    /**
     * Session start in timestamp.
     *
     */
    private session: number;
    /**
     * Return current session timestamp.
     */
    protected get currentSession(): number {
        return this.session;
    }
    /**
     * Start a new session.
     *
     */
    private startNewSession() {
        this.session = +new Date();
        this.inCleanUpState = false;
    }
    /**
     * Generate new initial state start new session.
     *
     * @param {TState} state - Current store state.
     */
    private getCleanStateAndStartNewSession(state: TState2): TState2 {
        let newState: TState2 | void;
        if (this.storeWillCleanUp != null) {
            newState = this.storeWillCleanUp();
        }
        if (newState == null) {
            newState = this.getInitialState();
        }
        this.startNewSession();
        return newState;
    }
    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param {TState} state - Current store state.
     * @param {DispatcherMessage<any>} payload - Disaptched payload message.
     */
    reduce(state: TState2, payload: DispatcherMessage<any>): TState2 {
        if (this.inCleanUpState) {
            state = this.getCleanStateAndStartNewSession(state);
        }
        this.actionsHandlers.forEach((handler: ActionHandler<Function, TState2>, action: Function) => {
            if (payload.action instanceof action && this.shouldHandleAction(payload.action, state)) {
                let newState = handler(payload.action, state);
                if (newState != null) {
                    state = newState;
                }
            }
        });
        if (this.inCleanUpState) {
            state = this.getCleanStateAndStartNewSession(state);
        }
        return state;
    }
    /**
     * Checks if two versions of state are the same.
     * You do not need to override.
     *
     * @param {TState} startingState - Starting state (current).
     * @param {TState} endingState - Ending state (updated).
     */
    areEqual(startingState: TState2, endingState: TState2): boolean {
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
     * This method will return the dispatcher for this store.
     *
     */
    getDispatcher(): DispatcherBuilder {
        return super.getDispatcher();
    }
    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     *
     */
    abstract getInitialState(): TState2;
    /**
     * Method is invoked immediately before a store began to clean the state.
     * It's called in the middle of a dispatch cycle.
     * If state returned in this method, it's used for initial state.
     *
     */
    protected storeWillCleanUp: undefined | StoreWillCleanup<TState2>;

    /**
     * Check if action should handled.
     * By default always return true.
     *
     * @param {Object} action - Action payload data.
     * @param {TState} state - Updated store state.
     */
    protected shouldHandleAction(action: Object, state: TState2): boolean {
        return true;
    }
    /**
     * Clean up all store data.
     * This method is only available in the middle of a dispatch!
     *
     * @return {Immutable.Map<string, T>} - Initial empty state.
     */
    protected cleanUpStore(): void {
        if (!Dispatcher.isDispatching()) {
            throw new Error(`SimplrFlux.ReduceStore.cleanUpStore() [${this.constructor.name}]: ` +
                "Cannot clean up store when dispatch is not in the middle of a dispatch.");
        }
        this.inCleanUpState = true;
    }
    /**
     * Register specified action handler in this store.
     *
     * @param {Function} action - Action class function.
     * @param {ActionHandler<TClass, TState>} handler - Action handler function.
     */
    protected registerAction<TClass>(action: Function, handler: ActionHandler<TClass, TState2>): void {
        let actionType = typeof action;
        if (actionType !== "function") {
            throw new Error(`SimplrFlux.ReduceStore.registerAction() [${this.constructor.name}]: ` +
                `cannot register action with 'action' type of '${actionType}'.`);
        }
        let handlerType = typeof handler;
        if (handlerType !== "function") {
            throw new Error(`SimplrFlux.ReduceStore.registerAction() [${this.constructor.name}]: ` +
                `cannot register action with 'handler' type of '${handlerType}'.`);
        }
        if (this.actionsHandlers.has(action)) {
            throw new Error(`SimplrFlux.ReduceStore.registerAction() [${this.constructor.name}]: ` +
                `Handler for action '${action.name}' has already been registered.`);
        }
        this.actionsHandlers = this.actionsHandlers.set(action, handler);
    }
}
