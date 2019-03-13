import { createDispatcher } from "../dispatcher";

interface Action {
    type: string;
}

let dispatcher = createDispatcher<Action>();
const TEST_ACTION: Action = { type: "test" };

beforeEach(() => {
    dispatcher = createDispatcher<Action>();
});

it("register store and dispatch action and then unregister store", () => {
    const mock = jest.fn();

    const dispatchToken = dispatcher.register(mock);
    dispatcher.dispatch(TEST_ACTION);

    expect(mock).toBeCalledWith(TEST_ACTION);

    dispatcher.unregister(dispatchToken);
});

it("waitFor to resolve in specific store order", () => {
    const callOrder: string[] = [];

    let dispatchToken1: string = "";
    let dispatchToken2: string = "";
    let dispatchToken3: string = "";

    const store1 = () => {
        dispatcher.waitFor([dispatchToken3, dispatchToken2]);
        callOrder.push(dispatchToken1);
    };
    const store2 = () => callOrder.push(dispatchToken2);
    const store3 = () => callOrder.push(dispatchToken3);

    dispatchToken1 = dispatcher.register(store1);
    dispatchToken2 = dispatcher.register(store2);
    dispatchToken3 = dispatcher.register(store3);

    dispatcher.dispatch(TEST_ACTION);

    expect(callOrder).toEqual([dispatchToken3, dispatchToken2, dispatchToken1]);
});

it("waitFor must throw while not being in middle of dispatch", () => {
    expect(() => dispatcher.waitFor(["hello"])).toThrow();
});

it("waitFor store that does not exist", () => {
    const store1 = () => {
        expect(() => dispatcher.waitFor(["hello"])).toThrow();
    };

    dispatcher.register(store1);

    dispatcher.dispatch(TEST_ACTION);
});

it("waitFor circular store", () => {
    let dispatchToken1: string = "";
    let dispatchToken2: string = "";

    const store1 = () => {
        dispatcher.waitFor([dispatchToken2]);
    };
    const store2 = () => {
        expect(() => dispatcher.waitFor([dispatchToken1])).toThrow();
    };

    dispatchToken1 = dispatcher.register(store1);
    dispatchToken2 = dispatcher.register(store2);

    dispatcher.dispatch(TEST_ACTION);
});

it("waitFor bigger circular store", () => {
    let dispatchToken1: string = "";
    let dispatchToken2: string = "";
    let dispatchToken3: string = "";

    const store1 = () => {
        dispatcher.waitFor([dispatchToken2]);
    };
    const store2 = () => {
        dispatcher.waitFor([dispatchToken3]);
    };
    const store3 = () => {
        expect(() => dispatcher.waitFor([dispatchToken1])).toThrow();
    };

    dispatchToken1 = dispatcher.register(store1);
    dispatchToken2 = dispatcher.register(store2);
    dispatchToken3 = dispatcher.register(store3);

    dispatcher.dispatch(TEST_ACTION);
});

it("dispatch in the middle of dispatch", () => {
    const store1 = () => {
        expect(() => dispatcher.dispatch(TEST_ACTION)).toThrow();
    };

    dispatcher.register(store1);

    dispatcher.dispatch(TEST_ACTION);
});
