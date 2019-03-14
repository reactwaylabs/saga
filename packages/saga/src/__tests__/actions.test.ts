import { createSagaAction, createFluxAction, FSA } from "../actions";

jest.mock("../helpers", () => ({
    ...jest.requireActual("../helpers"),
    generateRandomString: () => "RANDOM"
}));

class TestSagaAction {}

interface TestFSA extends FSA {
    type: "TEST";
}

it("creates saga action from class payload", () => {
    expect(createSagaAction(TestSagaAction)).toMatchSnapshot();
});

it("throw when creating saga action from object payload", () => {
    expect(() => createSagaAction({})).toThrow();
});

it("creates FSA action", () => {
    expect(createFluxAction<TestFSA>("TEST", undefined)).toMatchSnapshot();
});
