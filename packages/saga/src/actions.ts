import { generateRandomString, instanceOfClass } from "./helpers";

export interface FluxStandardAction<TPayload, TMeta = undefined> {
    /**
     * The `type` of an action identifies to the consumer the nature of the action that has occurred.
     * Two actions with the same `type` MUST be strictly equivalent (using `===`)
     */
    type: string;
    /**
     * The optional `payload` property MAY be any type of value.
     * It represents the payload of the action.
     * Any information about the action that is not the type or status of the action should be part of the `payload` field.
     * By convention, if `error` is `true`, the `payload` SHOULD be an error object.
     * This is akin to rejecting a promise with an error object.
     */
    payload?: TPayload;
    /**
     * The optional `error` property MAY be set to true if the action represents an error.
     * An action whose `error` is true is analogous to a rejected Promise.
     * By convention, the `payload` SHOULD be an error object.
     * If `error` has any other value besides `true`, including `undefined`, the action MUST NOT be interpreted as an error.
     */
    error?: boolean;
    /**
     * The optional `meta` property MAY be any type of value.
     * It is intended for any extra information that is not part of the payload.
     */
    meta?: TMeta;
}

export interface ErrorFluxStandardAction<TCustomError extends Error, TMeta = undefined> extends FluxStandardAction<TCustomError, TMeta> {
    error: true;
}

/**
 * Alias for FluxStandardAction.
 */
export type FSA<TPayload, TMeta = undefined> = FluxStandardAction<TPayload, TMeta>;

/**
 * Alias for ErrorFluxStandardAction.
 */
export type ErrorFSA<TCustomError extends Error, TMeta = undefined> = ErrorFluxStandardAction<TCustomError, TMeta>;

const SAGA_ACTION_TYPE: string = `SAGA_${generateRandomString()}`;

export function createSagaAction<TClassAction extends object>(action: TClassAction): FluxStandardAction<TClassAction> {
    // TODO: Omit this code in production.
    if (!instanceOfClass(action)) {
        throw new Error("createSagaAction(...): Action must be initialized from a class.");
    }

    const isError = action instanceof Error;

    return {
        type: SAGA_ACTION_TYPE,
        payload: action,
        error: isError
    };
}

export function isSagaAction<TPayload>(action: any): action is FluxStandardAction<TPayload> {
    return action.type === SAGA_ACTION_TYPE;
}

/**
 * Returns `true` if `action` is FSA compliant.
 */
export function isFSA<TPayload, TMeta = undefined>(action: any): action is FluxStandardAction<TPayload, TMeta> {
    return typeof action === "object" && typeof action.type === "string" && Object.keys(action).every(isValidKey);
}

/**
 * Returns `true` if `action` is FSA compliant error.
 */
export function isErrorFSA<TCustomError extends Error, TMeta = undefined>(
    action: any
): action is ErrorFluxStandardAction<TCustomError, TMeta> {
    return isFSA(action) && action.error === true;
}

function isValidKey(key: string): boolean {
    return ["type", "payload", "error", "meta"].indexOf(key) > -1;
}
