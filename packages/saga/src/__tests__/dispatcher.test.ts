import { createDispatcher } from "../dispatcher";
import { createFluxAction } from "../actions";
import { FSA } from "../contracts";

import "./test-utils";

let dispatcher = createDispatcher();

interface TestAction extends FSA {
    type: "TEST";
    payload: {
        text: string;
    };
}

const testActionCreator = () => createFluxAction<TestAction>("TEST", { text: "string" });

beforeEach(() => {
    dispatcher = createDispatcher();
});

it("register store and dispatch action and then unregister store", () => {
    const mock = jest.fn();

    const dispatchToken = dispatcher.register(mock);
    dispatcher.dispatch<TestAction>(testActionCreator());

    expect(mock.mock.calls[0][0]).toBeFSA();

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

    dispatcher.dispatch(testActionCreator());

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

    dispatcher.dispatch(testActionCreator());
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

    dispatcher.dispatch(testActionCreator());
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

    dispatcher.dispatch<TestAction>({
        type: "TEST",
        payload: {
            text: "test"
        }
    });
});

it("dispatch in the middle of dispatch", () => {
    const store1 = () => {
        expect(() => dispatcher.dispatch(testActionCreator())).toThrow();
    };

    dispatcher.register(store1);

    dispatcher.dispatch(testActionCreator());
});
