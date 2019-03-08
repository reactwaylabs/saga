import { createStore, Store } from "../store";
import { createDispatcher, Dispatcher } from "../dispatcher";

interface Action {
    type: string;
}

interface ActionIncrement extends Action {
    type: "COUNTER_INCREMENT";
}

interface ActionDecrement extends Action {
    type: "COUNTER_DECREMENT";
}

type StoreActions = ActionIncrement | ActionDecrement;

let dispatcher = createDispatcher<Action>();
let store = createTestStore(dispatcher);

interface StoreState {
    counter: number;
}

function createTestStore(dispatcher: Dispatcher<Action>): Store<StoreState, StoreActions> {
    return createStore<StoreState, StoreActions>({
        name: "test",
        dispatcher: dispatcher as Dispatcher<StoreActions>,
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
    dispatcher = createDispatcher<Action>();
    store = createTestStore(dispatcher);
});

it("dispatched action updates store state", () => {
    const stub = jest.fn();

    store.subscribe(stub);
    expect(store.getState().counter).toBe(0);

    dispatcher.dispatch<ActionIncrement>({
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

    dispatcher.dispatch<ActionIncrement>({
        type: "COUNTER_INCREMENT"
    });

    expect(stub).toBeCalled();
    store.unsubscribe(stub);
    expect(store.getSubscribersCount()).toBe(0);
});
