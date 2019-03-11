import { createDispatcher } from "../dispatcher";

interface Action {
    type: string;
}

let dispatcher = createDispatcher<Action>();
const TEST_ACTION: Action = { type: "test" };

const STORE_NAME1: string = "name-1";
const STORE_NAME2: string = "name-2";
const STORE_NAME3: string = "name-3";

beforeEach(() => {
    dispatcher = createDispatcher<Action>();
});

it("register store and dispatch action and then unregister store", () => {
    const mock = jest.fn();

    dispatcher.register(STORE_NAME1, mock);
    dispatcher.dispatch(TEST_ACTION);

    expect(mock).toBeCalledWith(TEST_ACTION);

    dispatcher.unregister(STORE_NAME1);
});

it("waitFor to resolve in specific store order", () => {
    const callOrder: string[] = [];
    const store1 = () => {
        dispatcher.waitFor([STORE_NAME3, STORE_NAME2]);
        callOrder.push(STORE_NAME1);
    };
    const store2 = () => callOrder.push(STORE_NAME2);
    const store3 = () => callOrder.push(STORE_NAME3);

    dispatcher.register(STORE_NAME1, store1);
    dispatcher.register(STORE_NAME2, store2);
    dispatcher.register(STORE_NAME3, store3);

    dispatcher.dispatch(TEST_ACTION);

    expect(callOrder).toEqual([STORE_NAME3, STORE_NAME2, STORE_NAME1]);
});

it("waitFor must throw while not being in middle of dispatch", () => {
    expect(() => dispatcher.waitFor([STORE_NAME1])).toThrow();
});

it("waitFor store that does not exist", () => {
    const store1 = () => {
        expect(() => dispatcher.waitFor([STORE_NAME2])).toThrow();
    };

    dispatcher.register(STORE_NAME1, store1);

    dispatcher.dispatch(TEST_ACTION);
});

it("waitFor circular store", () => {
    const store1 = () => {
        dispatcher.waitFor([STORE_NAME2]);
    };
    const store2 = () => {
        expect(() => dispatcher.waitFor([STORE_NAME1])).toThrow();
    };

    dispatcher.register(STORE_NAME1, store1);
    dispatcher.register(STORE_NAME2, store2);

    dispatcher.dispatch(TEST_ACTION);
});

it("waitFor bigger circular store", () => {
    const store1 = () => {
        dispatcher.waitFor([STORE_NAME2]);
    };
    const store2 = () => {
        dispatcher.waitFor([STORE_NAME3]);
    };
    const store3 = () => {
        expect(() => dispatcher.waitFor([STORE_NAME1])).toThrow();
    };

    dispatcher.register(STORE_NAME1, store1);
    dispatcher.register(STORE_NAME2, store2);
    dispatcher.register(STORE_NAME3, store3);

    dispatcher.dispatch(TEST_ACTION);
});

it("dispatch in the middle of dispatch", () => {
    const store1 = () => {
        expect(() => dispatcher.dispatch(TEST_ACTION)).toThrow();
    };

    dispatcher.register(STORE_NAME1, store1);

    dispatcher.dispatch(TEST_ACTION);
});
