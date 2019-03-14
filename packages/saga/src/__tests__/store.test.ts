import { createStore, Store } from "../store";
import { createDispatcher, Dispatcher } from "../dispatcher";
import { FSA, createFluxAction } from "../actions";

import { handleFluxActions } from "../store";

interface ActionIncrement extends FSA<undefined> {
    type: "COUNTER_INCREMENT";
}

interface ActionDecrement extends FSA<undefined> {
    type: "COUNTER_DECREMENT";
}

type StoreActions = ActionIncrement | ActionDecrement;

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
        // reducer: (state, action) => {
        //     switch (action.type) {
        //         case "COUNTER_INCREMENT": {
        //             return {
        //                 counter: state.counter + 1
        //             };
        //         }
        //         case "COUNTER_DECREMENT": {
        //             return {
        //                 counter: state.counter - 1
        //             };
        //         }
        //         default: {
        //             return state;
        //         }
        //     }
        // }
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

    dispatcher.dispatchFSA(createFluxAction<ActionIncrement>("COUNTER_INCREMENT", undefined));

    expect(store.getState().counter).toBe(1);
    expect(store.hasChanged()).toBe(true);
});

it("dispatched action updates state and store emits change", () => {
    const stub = jest.fn();

    expect(store.getSubscribersCount()).toBe(0);
    store.subscribe(stub);
    expect(store.getSubscribersCount()).toBe(1);

    dispatcher.dispatchFSA(createFluxAction<ActionIncrement>("COUNTER_INCREMENT", undefined));

    expect(stub).toBeCalled();
    store.unsubscribe(stub);
    expect(store.getSubscribersCount()).toBe(0);
});
