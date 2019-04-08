import { createStore, Store } from "../store";
import { createDispatcher } from "../dispatcher";
import { createFluxAction } from "../actions";

import { handleActions } from "../store";
import { FSA, Dispatcher } from "../contracts";

interface IncrementAction extends FSA<{ plusCount: number }> {
    type: "COUNTER_INCREMENT";
}

interface DecrementAction extends FSA<{ minusCount: number }> {
    type: "COUNTER_DECREMENT";
}

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
        reducer: handleActions<StoreState, StoreActions>({
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

    dispatcher.dispatch(createFluxAction<IncrementAction>("COUNTER_INCREMENT", { plusCount: 1 }));

    expect(store.getState().counter).toBe(1);
    expect(store.hasChanged()).toBe(true);
});

it("dispatched action updates state and store emits change", () => {
    const stub = jest.fn();

    expect(store.getSubscribersCount()).toBe(0);
    store.subscribe(stub);
    expect(store.getSubscribersCount()).toBe(1);

    dispatcher.dispatch(createFluxAction<IncrementAction>("COUNTER_INCREMENT", { plusCount: 1 }));

    expect(stub).toBeCalled();
    store.unsubscribe(stub);
    expect(store.getSubscribersCount()).toBe(0);
});
