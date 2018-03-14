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

class AnotherAction {
    constructor(private _value: number) {}
    public get value(): number {
        return this._value;
    }
}

class TestReduceStore extends ReduceStore<TestState> {
    constructor(_dispatcher: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(_dispatcher);
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

    public registerTestAction<TAction>(action: Function, handler: ActionHandler<TAction, TestState>): void {
        return this.registerAction(action, handler);
    }
}

let dispatcher: DispatcherClass;
beforeEach(() => {
    dispatcher = new DispatcherClass();
});

const testHandler = (action: TestAction, state: TestState): TestState => ({
    value: action.value
});

it("should have no registered actions by default", () => {
    const reduceStore = new TestReduceStore(dispatcher);
    expect(reduceStore.getActionsHandlers().count()).toBe(0);
});

it("should register action by type", () => {
    const reduceStore = new TestReduceStore(dispatcher);
    reduceStore.registerTestAction(TestAction, testHandler);

    const registeredHandlers = reduceStore.getActionsHandlers();
    expect(registeredHandlers.count()).toBe(1);
    expect(registeredHandlers.first()).toBe(testHandler);
});

it("should call action handler for dispatched registered action type", () => {
    const mockedHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher);
    reduceStore.registerTestAction(TestAction, mockedHandler);

    const testAction = new TestAction(1);

    const stateBeforeDispatch = reduceStore.getState();

    dispatcher.dispatch({
        action: testAction
    });

    expect(mockedHandler).toBeCalledWith(testAction, stateBeforeDispatch);
});

it("should not call action handler for dispatched non-registered action type", () => {
    const mockedHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher);
    reduceStore.registerTestAction(TestAction, mockedHandler);

    const anotherAction = new AnotherAction(1);

    dispatcher.dispatch({
        action: anotherAction
    });

    expect(mockedHandler).not.toBeCalled();
});

it("should call action handler for dispatched registered action type and not call action handler for non-registered one", () => {
    const mockedHandler = jest.fn(testHandler);
    const mockedAnotherHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher);
    reduceStore.registerTestAction(TestAction, mockedHandler);
    reduceStore.registerTestAction(AnotherAction, mockedAnotherHandler);

    const anotherAction = new AnotherAction(1);

    dispatcher.dispatch({
        action: anotherAction
    });

    expect(mockedHandler).not.toBeCalled();
    expect(mockedAnotherHandler).toBeCalled();
});

it("should update store state after invoking dispatched registered action type", () => {
    const mockedHandler = jest.fn(testHandler);
    const reduceStore = new TestReduceStore(dispatcher);
    reduceStore.registerTestAction(TestAction, mockedHandler);

    const testAction = new TestAction(1);
    expect(reduceStore.getState()).toEqual(reduceStore.getInitialState());

    dispatcher.dispatch({
        action: testAction
    });

    expect(reduceStore.getState()).toEqual({ value: testAction.value } as TestState);
});

// TODO: cleanUpStore test
