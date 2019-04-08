import { createFluxAction, isFluxAction, isFluxErrorAction } from "../actions";
import { FSA } from "../contracts";

jest.mock("../helpers", () => ({
    ...jest.requireActual("../helpers"),
    generateRandomString: () => "RANDOM"
}));

interface TestFSA extends FSA {
    type: "TEST";
}

it("creates FSA action", () => {
    const fluxAction = createFluxAction<TestFSA>("TEST", undefined);

    expect(fluxAction).toMatchSnapshot();
});

it("check if FSA object is FSA", () => {
    const fluxAction = createFluxAction<TestFSA>("TEST", undefined);

    expect(isFluxAction(fluxAction)).toBe(true);
});

it("check if FSA object is Error FSA", () => {
    const actionPayload = new Error("Test Error");
    const fluxAction = createFluxAction<TestFSA>("TEST", actionPayload);

    expect(isFluxErrorAction(fluxAction)).toBe(true);
});

it("check if empty object is FSA", () => {
    const action = {};

    expect(isFluxAction(action)).toBe(false);
});
