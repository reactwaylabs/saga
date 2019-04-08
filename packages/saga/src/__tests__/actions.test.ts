import { isClassAction, createFluxAction, isFluxAction, isFluxErrorAction, createSagaAction, isSagaAction } from "../actions";
import { FSA } from "../contracts";

jest.mock("../helpers", () => ({
    ...jest.requireActual("../helpers"),
    generateRandomString: () => "RANDOM"
}));

interface TestFSA extends FSA {
    type: "TEST";
}

class TestAction {}

describe("flux actions", () => {
    it("creates FSA action", () => {
        const fluxAction = createFluxAction<TestFSA>("TEST", undefined);

        expect(fluxAction).toMatchSnapshot();
    });
    it("creates FSA action with non object throws", () => {
        expect(() => createFluxAction("TEST", "")).toThrow();
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
});

describe("class actions", () => {
    it("check if class action is class action", () => {
        const instance = new TestAction();

        expect(isClassAction(instance)).toBe(true);
    });

    it("check if random class is class action", () => {
        class RandomClass {}
        const instance = new RandomClass();

        expect(isClassAction(instance)).toBe(false);
    });

    it("check if non object is class action", () => {
        const nonObject = "";

        expect(isClassAction(nonObject)).toBe(false);
    });

    it("creates saga action with class action", () => {
        const sagaAction = createSagaAction(new TestAction());

        expect(isFluxAction(sagaAction)).toBe(true);
        expect(isSagaAction(sagaAction)).toBe(true);
    });
});
