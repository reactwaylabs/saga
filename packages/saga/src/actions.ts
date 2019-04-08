import { FSA, ErrorFSA } from "./contracts";

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
