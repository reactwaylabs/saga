import { Dispatcher, DispatcherRegisterHandler } from "./dispatcher";
import { TinyEmitter, Callback } from "./emitter";
import { FSA, isSagaAction, ClassAction } from "./actions";

class StoreClass<TState, TPayload extends FSA<any, any> = FSA<any, any>> implements Store<TState, TPayload> {
    constructor(
        private readonly initialState: TState,
        private dispatcher: Dispatcher<TPayload>,
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

    public getDispatcher(): Dispatcher<TPayload> {
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
        return this.emitter.getCount();
    }

    private onDispatch: DispatcherRegisterHandler<TPayload> = payload => {
        this.hasStoreChanged = false;

        const currentState = this.state;
        const nextState = this.reducer(currentState, payload);

        if (!this.areEqual(currentState, nextState)) {
            this.state = nextState;

            this.hasStoreChanged = true;
            this.emitter.emit();
        }
    };
}

export type StoreReduceHandler<TState, TPayload extends FSA<any, any> = FSA<any, any>> = (state: TState, payload: TPayload) => TState;
export type StoreAreEqualHandler<TState> = (state: TState, nextState: TState) => boolean;

export interface Store<TState, TPayload extends FSA<any, any> = FSA<any, any>> {
    getState(): TState;
    getDispatcher(): Dispatcher<TPayload>;
    getDispatchToken(): string;
    hasChanged(): boolean;
    subscribe(callback: () => void): () => void;
    unsubscribe(callback: () => void): void;
    getSubscribersCount(): number;
}

export interface StoreOptions<TState, TPayload extends FSA<any, any> = FSA<any, any>> {
    name: string;
    initialState: TState;
    dispatcher: Dispatcher<TPayload>;
    reducer: StoreReduceHandler<TState, TPayload>;
    areEqual?: StoreAreEqualHandler<TState>;
}

export function createStore<TState, TPayload extends FSA<any, any> = FSA<any, any>>(
    options: StoreOptions<TState, TPayload>
): Store<TState, TPayload> {
    const areEqual: StoreAreEqualHandler<TState> = options.areEqual != null ? options.areEqual : (state, nextState) => state === nextState;

    return new StoreClass<TState, TPayload>(options.initialState, options.dispatcher, options.reducer, areEqual);
}

export function registerActionHandler<TState, TAction extends ClassAction>(
    action: TAction,
    callback: (state: TState, action: InstanceType<TAction>) => TState
): StoreReduceHandler<TState> {
    return (state, payload) => {
        if (isSagaAction(payload) && payload.payload instanceof action) {
            return callback(state, payload.payload as InstanceType<TAction>);
        }

        return state;
    };
}

export function combineHandlers<TState>(handlers: Array<StoreReduceHandler<TState, any>>): StoreReduceHandler<TState, any> {
    return (state, payload) => {
        let nextState = state;

        for (const handler of handlers) {
            nextState = handler(nextState, payload);
        }

        return nextState;
    };
}

// prettier-ignore
export type ActionHandler<TState, TActions extends FSA<any>> = {
    [TType in TActions["type"]]: (state: TState, action: Extract<TActions, {type: TType}>) => TState
};

export function handleFluxActions<TState, TActions extends FSA<any>>(
    handlers: ActionHandler<TState, TActions>
): StoreReduceHandler<TState, TActions> {
    return (state: TState, action: TActions): TState => {
        for (const key in handlers) {
            if (action.type === key) {
                const handler = handlers[key as TActions["type"]];
                return handler(state, action as any);
            }
        }
        return state;
    };
}

export interface IncrementAction
    extends FSA<{
        amount: string;
    }> {
    type: "INCREMENT";
}

export interface DecrementAction
    extends FSA<{
        amount: number;
    }> {
    type: "DECREMENT";
}

class IncrementClassAction {
    public amount: number = 1;
}

type Actions = IncrementAction | DecrementAction;

interface StoreState {
    counter: number;
}

combineHandlers<StoreState>([
    handleFluxActions<StoreState, Actions>({
        INCREMENT: (state, action) => {
            action.payload.amount;
            return state;
        },
        DECREMENT: (state, action) => {
            action.payload.amount;
            return state;
        }
    }),
    registerActionHandler(IncrementClassAction, (state, action) => {
        action.amount;
        return {
            ...state,
            counter: state.counter + action.amount
        };
    })
]);
