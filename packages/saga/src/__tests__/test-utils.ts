import { printReceived } from "jest-matcher-utils";
import { isAction } from "../actions";

function toBeFSA(item: object) {
    const isFluxAction = isAction(item);

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
        }
    }
}

expect.extend({
    toBeFSA: toBeFSA,
});
