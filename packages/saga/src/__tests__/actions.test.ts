import { createAction, FSA, isAction, isErrorAction } from "../actions";

jest.mock("../helpers", () => ({
    ...jest.requireActual("../helpers"),
    generateRandomString: () => "RANDOM"
}));

interface TestFSA extends FSA {
    type: "TEST";
}

it("creates FSA action", () => {
    const fluxAction = createAction<TestFSA>("TEST", undefined);

    expect(fluxAction).toMatchSnapshot();
});

it("check if FSA object is FSA", () => {
    const fluxAction = createAction<TestFSA>("TEST", undefined);

    expect(isAction(fluxAction)).toBe(true);
});

it("check if FSA object is Error FSA", () => {
    const actionPayload = new Error("Test Error");
    const fluxAction = createAction<TestFSA>("TEST", actionPayload);

    expect(isErrorAction(fluxAction)).toBe(true);
});

it("check if empty object is FSA", () => {
    const action = {};

    expect(isAction(action)).toBe(false);
});
