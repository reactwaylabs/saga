import { createStore, Store, combineHandlers } from "../store";
import { createDispatcher, Dispatcher } from "../dispatcher";
import { FSA, createAction, createSagaAction } from "../actions";

import { handleFluxActions, registerActionHandler } from "../store";

interface IncrementAction extends FSA<{ plusCount: number }> {
    type: "COUNTER_INCREMENT";
}

interface DecrementAction extends FSA<{ minusCount: number }> {
    type: "COUNTER_DECREMENT";
}

class IncrementClassAction {
    constructor(private _plusCount: number = 1) {}

    public get plusCount(): number {
        return this._plusCount;
    }
}

class DecrementClassAction {
    constructor(private _minusCount: number = 1) {}

    public get minusCount(): number {
        return this._minusCount;
    }
}

class ResetClassAction {}

type StoreActions = IncrementAction | DecrementAction;

let dispatcher = createDispatcher();
let store = createTestStore(dispatcher);

interface StoreState {
    counter: number;
}

function createTestStore(_dispatcher: Dispatcher<any>): Store<StoreState> {
    return createStore<StoreState, StoreActions>({
        name: "test",
        dispatcher: _dispatcher,
        initialState: {
            counter: 0
        },
        reducer: handleFluxActions<StoreState, StoreActions>({
            COUNTER_INCREMENT: (state, action) => {
                return {
                    counter: state.counter + 1
                };
            },
            COUNTER_DECREMENT: (state, action) => {
                return {
                    counter: state.counter - 1
                };
            }
        })
    });
}

beforeEach(() => {
    dispatcher = createDispatcher();
    store = createTestStore(dispatcher);
});

it("dispatched action updates store state", () => {
    const stub = jest.fn();

    store.subscribe(stub);
    expect(store.getState().counter).toBe(0);

    dispatcher.dispatchAction(createAction<IncrementAction>("COUNTER_INCREMENT", { plusCount: 1 }));

    expect(store.getState().counter).toBe(1);
    expect(store.hasChanged()).toBe(true);
});

it("dispatched action updates state and store emits change", () => {
    const stub = jest.fn();

    expect(store.getSubscribersCount()).toBe(0);
    store.subscribe(stub);
    expect(store.getSubscribersCount()).toBe(1);

    dispatcher.dispatchAction(createAction<IncrementAction>("COUNTER_INCREMENT", { plusCount: 1 }));

    expect(stub).toBeCalled();
    store.unsubscribe(stub);
    expect(store.getSubscribersCount()).toBe(0);
});

it("register action handler with class increment action", () => {
    const handler = registerActionHandler<StoreState, typeof IncrementClassAction>(IncrementClassAction, (state, action) => {
        return {
            counter: state.counter + action.plusCount
        };
    });

    let state: StoreState = {
        counter: 0
    };

    state = handler(state, createSagaAction(new IncrementClassAction(2)));
    expect(state.counter).toBe(2);
});

it("combined class action handlers", () => {
    const handlers = combineHandlers<StoreState>([
        registerActionHandler(IncrementClassAction, (state, action) => {
            return {
                counter: state.counter + action.plusCount
            };
        }),
        registerActionHandler(DecrementClassAction, (state, action) => {
            return {
                counter: state.counter - action.minusCount
            };
        })
    ]);

    let state: StoreState = {
        counter: 0
    };

    state = handlers(state, createSagaAction(new IncrementClassAction(2)));
    expect(state.counter).toBe(2);
    state = handlers(state, createSagaAction(new DecrementClassAction(1)));
    expect(state.counter).toBe(1);
});

it("mixed class action handler and FSA handler", () => {
    type Actions = IncrementAction | DecrementAction;

    const handlers = combineHandlers<StoreState>([
        handleFluxActions<StoreState, Actions>({
            COUNTER_INCREMENT: (state, action) => {
                return {
                    ...state,
                    counter: state.counter + action.payload.plusCount
                };
            },
            COUNTER_DECREMENT: (state, action) => {
                return {
                    ...state,
                    counter: state.counter - action.payload.minusCount
                };
            }
        }),
        registerActionHandler(ResetClassAction, (state, _action) => {
            return {
                ...state,
                counter: 0
            };
        })
    ]);

    let state: StoreState = {
        counter: 0
    };

    state = handlers(state, createAction<IncrementAction>("COUNTER_INCREMENT", { plusCount: 2 }));
    expect(state.counter).toBe(2);
    state = handlers(state, createSagaAction(new ResetClassAction()));
    expect(state.counter).toBe(0);
    state = handlers(state, createAction<DecrementAction>("COUNTER_DECREMENT", { minusCount: 2 }));
    expect(state.counter).toBe(-2);
});
