import * as Flux from "flux";
import * as Immutable from "immutable";
import { ReduceStore, ActionHandler } from "../reduce-store";
import { DispatcherClass, DispatcherMessage } from "../../index";

type TestState = {
    value: number;
};

class TestAction {
    constructor(private _value: number) {}
    public get value(): number {
        return this._value;
    }
}

class TestReduceStore extends ReduceStore<TestState> {
    constructor(
        dispatcher: Flux.Dispatcher<DispatcherMessage<any>>,
        testHandler?: (action: TestAction, state: TestState) => TestState | undefined
    ) {
        super(dispatcher);
        if (testHandler != null) {
            this.registerAction<TestAction>(TestAction, testHandler);
        }
    }
    public getInitialState(): TestState {
        return {
            value: 0
        };
    }

    /**
     * Test class helper to get registered action handlers
     */
    public getActionsHandlers(): Immutable.Map<Function, ActionHandler<any, TestState>> {
        return (this as any).actionsHandlers;
    }
}

let dispatcher: DispatcherClass;
beforeEach(() => {
    dispatcher = new DispatcherClass();
});

const testHandler = (action: TestAction, state: TestState): TestState => {
    return {
        value: action.value
    };
};

it("should have no registered actions by default", () => {
    const reduceStore = new TestReduceStore(dispatcher, undefined);
    expect(reduceStore.getActionsHandlers().count()).toBe(0);
});

it("should register action by type", () => {
    const reduceStore = new TestReduceStore(dispatcher, testHandler);

    const registeredHandlers = reduceStore.getActionsHandlers();
    expect(registeredHandlers.count()).toBe(1);
    expect(registeredHandlers.first()).toBe(testHandler);
});

it("should call action handler for dispatched registered action type", () => {
    const mockedHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher, mockedHandler);

    const testAction = new TestAction(1);

    const stateBeforeDispatch = reduceStore.getState();

    dispatcher.dispatch(testAction);

    expect(mockedHandler).toBeCalledWith(testAction, stateBeforeDispatch);
});

it("should update store state after invoking dispatched registered action type", () => {
    const mockedHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher, mockedHandler);

    const testAction = new TestAction(1);

    dispatcher.dispatch(testAction);

    expect(reduceStore.getState()).toEqual({ value: testAction.value } as TestState);
});
