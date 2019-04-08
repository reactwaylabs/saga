import { AppDispatcher } from "./dispatcher";
import { TinyEmitter, Callback } from "@reactway/tiny-emitter";
import { FSA, Dispatcher, DispatcherRegisterHandler } from "./contracts";

class StoreClass<TState, TPayload extends FSA = FSA> implements Store<TState> {
    constructor(
        private readonly initialState: TState,
        private dispatcher: Dispatcher,
        protected reducer: StoreReduceHandler<TState, TPayload>,
        protected areEqual: StoreAreEqualHandler<TState>
    ) {
        this.dispatchToken = this.dispatcher.register(this.onDispatch);
    }

    protected state: TState = { ...this.initialState };
    private hasStoreChanged: boolean = false;
    private emitter: TinyEmitter<Callback> = new TinyEmitter();
    private readonly dispatchToken: string;

    public getDispatchToken(): string {
        return this.dispatchToken;
    }

    public getState(): TState {
        return this.state;
    }

    public getDispatcher(): Dispatcher {
        return this.dispatcher;
    }

    public hasChanged(): boolean {
        return this.hasStoreChanged;
    }

    public subscribe(callback: () => void): () => void {
        return this.emitter.addListener(callback);
    }

    public unsubscribe(callback: () => void): void {
        this.emitter.removeListener(callback);
    }

    public getSubscribersCount(): number {
        return this.emitter.getListenersCount();
    }

    private onDispatch: DispatcherRegisterHandler = payload => {
        this.hasStoreChanged = false;

        const currentState = this.state;
        const nextState = this.reducer(currentState, payload as TPayload);

        if (!this.areEqual(currentState, nextState)) {
            this.state = nextState;

            this.hasStoreChanged = true;
            this.emitter.emit();
        }
    };
}

export type StoreReduceHandler<TState, TPayload extends FSA = FSA> = (state: TState, payload: TPayload) => TState;
export type StoreAreEqualHandler<TState> = (state: TState, nextState: TState) => boolean;

export interface Store<TState> {
    getState(): TState;
    getDispatcher(): Dispatcher;
    getDispatchToken(): string;
    hasChanged(): boolean;
    subscribe(callback: () => void): () => void;
    unsubscribe(callback: () => void): void;
    getSubscribersCount(): number;
}

export interface StoreOptions<TState, TPayload extends FSA = FSA> {
    name: string;
    initialState: TState;
    dispatcher?: Dispatcher;
    reducer: StoreReduceHandler<TState, TPayload>;
    areEqual?: StoreAreEqualHandler<TState>;
}

export function createStore<TState, TPayload extends FSA = FSA>(options: StoreOptions<TState, TPayload>): Store<TState> {
    const areEqual: StoreAreEqualHandler<TState> = options.areEqual != null ? options.areEqual : (state, nextState) => state === nextState;
    const dispatcher = options.dispatcher != null ? options.dispatcher : AppDispatcher;

    return new StoreClass<TState, TPayload>(options.initialState, dispatcher, options.reducer, areEqual);
}

// tslint:disable-next-line:no-any
export function combineHandlers<TState>(handlers: Array<StoreReduceHandler<TState, any>>): StoreReduceHandler<TState, any> {
    return (state, payload) => {
        let nextState = state;

        for (const handler of handlers) {
            nextState = handler(nextState, payload);
        }

        return nextState;
    };
}

export type ActionsHandlersObject<TState, TActions extends FSA> = {
    [TType in TActions["type"]]: (state: TState, action: Extract<TActions, { type: TType }>) => TState
};

export function handleActions<TState, TActions extends FSA>(
    handlers: ActionsHandlersObject<TState, TActions>
): StoreReduceHandler<TState, TActions> {
    return (state: TState, action: TActions): TState => {
        for (const key in handlers) {
            if (action.type === key) {
                const handler = handlers[key as TActions["type"]];
                // tslint:disable-next-line:no-any
                return handler(state, action as any);
            }
        }
        return state;
    };
}
