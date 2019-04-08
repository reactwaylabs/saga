import { printReceived } from "jest-matcher-utils";
import { isFluxAction } from "../actions";

function toBeFSA(item: object) {
    const isFSA = isFluxAction(item);

    return {
        pass: isFSA,
        message: () => {
            const is = isFSA ? "is" : "is not";

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
        }
    }
}

expect.extend({
    toBeFSA: toBeFSA,
});
