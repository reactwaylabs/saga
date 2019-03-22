// tslint:disable:no-any

/**
 * @see @url https://github.com/redux-utilities/flux-standard-action
 */
export interface FluxStandardAction<TPayload = any, TMeta = any> {
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
    payload: TPayload;
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
export type FSA<TPayload = any, TMeta = any> = FluxStandardAction<TPayload, TMeta>;

/**
 * Alias for ErrorFluxStandardAction.
 */
export type ErrorFSA<TCustomError extends Error, TMeta = undefined> = ErrorFluxStandardAction<TCustomError, TMeta>;

export function createAction<TAction extends FSA, TMeta = undefined>(
    type: TAction["type"],
    payload: TAction["payload"],
    meta?: TMeta
): TAction {
    if (payload != null && typeof payload !== "object") {
        throw new Error("createAction(...): Payload can only be object or undefined/null.");
    }

    const isError = (payload as object) instanceof Error;

    return {
        type: type,
        payload: payload,
        error: isError,
        meta: meta
    } as TAction;
}

/**
 * Returns `true` if `action` is FSA compliant.
 */
export function isAction<TPayload, TMeta = undefined>(action: any): action is FSA<TPayload, TMeta> {
    return typeof action === "object" && typeof action.type === "string" && Object.keys(action).every(isValidKey);
}

/**
 * Returns `true` if `action` is FSA compliant error.
 */
export function isErrorAction<TCustomError extends Error, TMeta = undefined>(action: any): action is ErrorFSA<TCustomError, TMeta> {
    return isAction(action) && action.error === true;
}

function isValidKey(key: string): boolean {
    return ["type", "payload", "error", "meta"].indexOf(key) > -1;
}
