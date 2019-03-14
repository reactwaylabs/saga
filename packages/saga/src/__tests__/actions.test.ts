import { createSagaAction } from "../actions";

jest.mock("../helpers", () => ({
    ...jest.requireActual("../helpers"),
    generateRandomString: () => "RANDOM"
}));

class TestAction {}

it("creates saga action from class payload", () => {
    expect(createSagaAction(TestAction)).toMatchSnapshot();
});

it("throw when creating saga action from object payload", () => {
    expect(() => createSagaAction({})).toThrow();
});
