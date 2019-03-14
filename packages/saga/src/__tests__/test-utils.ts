import { printReceived } from "jest-matcher-utils";
import { isFSA, isSagaAction } from "../actions";

function toBeFSA(item: object) {
    const isFluxAction = isFSA(item);

    return {
        pass: isFluxAction,
        message: () => {
            const is = isFluxAction ? "is" : "is not";

            // prettier-ignore
            return [
                `Received an object ${is} Flux Standard Action:`,
                `    ${printReceived(item)}`
            ].join("\n");
        }
    };
}

function toBeSagaAction(item: object) {
    const isFluxAction = isSagaAction(item);

    return {
        pass: isFluxAction,
        message: () => {
            const is = isFluxAction ? "is" : "is not";

            // prettier-ignore
            return [
                `Received an object ${is} Flux Standard Action:`,
                `    ${printReceived(item)}`
            ].join("\n");
        }
    };
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeFSA(): R;
            toBeSagaAction(): R;
        }
    }
}

expect.extend({
    toBeFSA: toBeFSA,
    toBeSagaAction: toBeSagaAction
});
