import { createDispatcher } from "../dispatcher";

import "./test-utils";

let dispatcher = createDispatcher();

class TestAction {}

beforeEach(() => {
    dispatcher = createDispatcher();
});

it("register store and dispatch action and then unregister store", () => {
    const mock = jest.fn();

    const dispatchToken = dispatcher.register(mock);
    dispatcher.dispatch(new TestAction());

    expect(mock.mock.calls[0][0]).toBeSagaAction();

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

    dispatcher.dispatch(new TestAction());

    expect(callOrder).toEqual([dispatchToken3, dispatchToken2, dispatchToken1]);
});

it("waitFor must throw while not being in the middle of dispatch", () => {
    expect(() => dispatcher.waitFor(["hello"])).toThrow();
});

it("waitFor store that does not exist", () => {
    const store1 = () => {
        expect(() => dispatcher.waitFor(["hello"])).toThrow();
    };

    dispatcher.register(store1);

    dispatcher.dispatch(new TestAction());
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

    dispatcher.dispatch(new TestAction());
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

    dispatcher.dispatch(new TestAction());
});

it("dispatch in the middle of dispatch", () => {
    const store1 = () => {
        expect(() => dispatcher.dispatch(new TestAction())).toThrow();
    };

    dispatcher.register(store1);

    dispatcher.dispatch(new TestAction());
});
