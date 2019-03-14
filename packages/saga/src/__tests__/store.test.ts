import { createStore, Store } from "../store";
import { createDispatcher, Dispatcher } from "../dispatcher";
import { FSA } from "../actions";

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

function createTestStore(_dispatcher: Dispatcher<any>): Store<StoreState, StoreActions> {
    return createStore<StoreState, StoreActions>({
        name: "test",
        dispatcher: _dispatcher,
        initialState: {
            counter: 0
        },
        reducer: (state, action) => {
            switch (action.type) {
                case "COUNTER_INCREMENT": {
                    return {
                        counter: state.counter + 1
                    };
                }
                case "COUNTER_DECREMENT": {
                    return {
                        counter: state.counter - 1
                    };
                }
                default: {
                    return state;
                }
            }
        }
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

    dispatcher.dispatchFSA<ActionIncrement>({
        type: "COUNTER_INCREMENT"
    });

    expect(store.getState().counter).toBe(1);
    expect(store.hasChanged()).toBe(true);
});

it("dispatched action updates state and store emits change", () => {
    const stub = jest.fn();

    expect(store.getSubscribersCount()).toBe(0);
    store.subscribe(stub);
    expect(store.getSubscribersCount()).toBe(1);

    dispatcher.dispatchFSA<ActionIncrement>({
        type: "COUNTER_INCREMENT"
    });

    expect(stub).toBeCalled();
    store.unsubscribe(stub);
    expect(store.getSubscribersCount()).toBe(0);
});
