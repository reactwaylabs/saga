import * as Flux from "flux";
import { ReduceStore as FluxReduceStore } from "flux/utils";
import * as Immutable from "immutable";
import { Dispatcher, DispatcherMessage, DispatcherClass } from "../dispatcher";

export type ActionHandler<TClass, TState> = (action: TClass, state: TState) => TState | void;

export type StoreWillCleanup<TState> = () => TState | void;

export abstract class ReduceStore<TState> extends FluxReduceStore<TState, DispatcherMessage<Function>> {
    /**
     * Creates an instance of ReduceStore.
     *
     * @param dispatcher An instance of Dispatcher to use for incoming payloads and emitting changes.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher || Dispatcher);
        this.startNewSession();
    }

    /**
     * Actions handlers list.
     */
    private actionsHandlers: Immutable.Map<Function, ActionHandler<any, TState>> = Immutable.Map<Function, ActionHandler<any, TState>>();

    /**
     * Is store in clean up state.
     *
     */
    private isInCleanUpState: boolean;

    /**
     * Session start timestamp.
     */
    private sessionTimestamp: number;

    /**
     * Returns a current session timestamp.
     */
    protected get currentSessionTimestamp(): number {
        return this.sessionTimestamp;
    }

    /**
     * Starts a new session.
     */
    private startNewSession(): void {
        this.sessionTimestamp = +new Date();
        this.isInCleanUpState = false;
    }

    /**
     * Generates a new initial state and starts a new session.
     *
     * @param state Current store state.
     */
    private getCleanStateAndStartNewSession(state: TState): TState {
        let newState: TState | undefined;
        if (this.storeWillCleanUp != null) {
            const cleanupState = this.storeWillCleanUp();
            if (cleanupState != null) {
                newState = cleanupState;
            }
        }
        if (newState == null) {
            newState = this.getInitialState();
        }
        this.startNewSession();
        return newState;
    }

    /**
     * Reduces the current state and given action to a new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state Current store state.
     * @param payload Dispatched payload message.
     */
    public reduce(state: TState, payload: DispatcherMessage<Function>): TState {
        if (this.isInCleanUpState) {
            return this.getCleanStateAndStartNewSession(state);
        }

        this.actionsHandlers.forEach((handler: ActionHandler<Function, TState>, action: Function): void => {
            if (payload.action instanceof action && this.shouldHandleAction(payload.action, state)) {
                const newState = handler(payload.action, state);
                if (newState != null) {
                    state = newState;
                }
            }
        });

        return state;
    }

    /**
     * Checks if two versions of state are the same.
     * You do not need to override this.
     *
     * @param startingState Starting state (current).
     * @param endingState Ending state (updated).
     */
    public areEqual(startingState: TState, endingState: TState): boolean {
        if (startingState != null &&
            endingState != null &&
            typeof startingState === "object" &&
            !Immutable.isImmutable(startingState)) {

            const startingKeys = Object.keys(startingState);
            if (startingKeys.length === 0) {
                return startingState === endingState;
            }
            const endingKeys = Object.keys(endingState);
            if (startingKeys.length !== endingKeys.length) {
                return false;
            }

            let areEqual = true;
            for (let i = 0; i < startingKeys.length; i++) {
                const key = startingKeys[i];
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
     * Returns the dispatcher for this store.
     */
    public getDispatcher(): DispatcherClass {
        return super.getDispatcher() as DispatcherClass;
    }

    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     *
     */
    public abstract getInitialState(): TState;

    /**
     * Method is invoked immediately before a store began to clean the state.
     * It's called in the middle of a dispatch cycle.
     * If a state is returned in this method, it's used as an initial state.
     *
     */
    protected storeWillCleanUp: undefined | StoreWillCleanup<TState>;

    /**
     * Check if an action should be handled.
     * By default, this is always true.
     *
     * @param action Action payload data.
     * @param state Updated store state.
     */
    protected shouldHandleAction(action: Object, state: TState): boolean {
        return true;
    }

    /**
     * Cleans up all store data.
     * This method is only available in the middle of dispatch!
     */
    protected cleanUpStore(): void {
        if (!Dispatcher.isDispatching()) {
            throw new Error(`SimplrFlux.ReduceStore.cleanUpStore() [${this.constructor.name}]: ` +
                "Cannot clean up store when dispatch is not in the middle of a dispatch.");
        }
        this.isInCleanUpState = true;
    }

    /**
     * Register specified action handler in this store.
     *
     * @param action Action class function.
     * @param handler Action handler function.
     */
    protected registerAction<TAction>(action: Function, handler: ActionHandler<TAction, TState>): void {
        const actionType = typeof action;
        if (actionType !== "function") {
            throw new Error(`SimplrFlux.ReduceStore.registerAction() [${this.constructor.name}]: ` +
                `cannot register action with 'action' type of '${actionType}'.`);
        }

        const handlerType = typeof handler;
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
