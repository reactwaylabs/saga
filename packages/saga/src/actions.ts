import { FSA, ErrorFSA } from "./contracts";
import { getNameOfObject, generateRandomString, isObject } from "./helpers";
import { CLASS_ACTION_NAME_SUFFIX } from "./constants";

export function createFluxAction<TAction extends FSA, TMeta = undefined>(
    type: TAction["type"],
    payload: TAction["payload"],
    meta?: TMeta
): TAction {
    if (payload != null && typeof payload !== "object") {
        throw new Error("createFluxAction(...): Payload can only be object or undefined/null.");
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
 * Returns `true` if `action` is Class action.
 */
export function isClassAction(action: unknown): action is object {
    if (!isObject(action)) {
        return false;
    }
    const name = getNameOfObject(action);

    return name.substr(name.length - CLASS_ACTION_NAME_SUFFIX.length, CLASS_ACTION_NAME_SUFFIX.length) === CLASS_ACTION_NAME_SUFFIX;
}

const SAGA_ACTION_TYPE: string = `SAGA_${generateRandomString()}`;

export function createSagaAction<TClassAction extends object, TMeta = undefined>(
    action: TClassAction,
    meta?: TMeta
): FSA<TClassAction, TMeta> {
    if (!isClassAction(action)) {
        throw new Error("createSagaAction(...): Payload can only be class with name suffix `Action`.");
    }

    const isError = action instanceof Error;

    return {
        type: SAGA_ACTION_TYPE,
        payload: action,
        error: isError,
        meta: meta
    };
}

export function isSagaAction<TPayload>(action: unknown): action is FSA<TPayload> {
    if (!isObject(action)) {
        return false;
    }
    return action.type === SAGA_ACTION_TYPE;
}

/**
 * Returns `true` if `action` is FSA compliant.
 */
export function isFluxAction<TPayload, TMeta = undefined>(action: unknown): action is FSA<TPayload, TMeta> {
    if (!isObject(action)) {
        return false;
    }

    return typeof action.type === "string" && Object.keys(action).every(isValidKey);
}

/**
 * Returns `true` if `action` is FSA compliant error.
 */
export function isFluxErrorAction<TCustomError extends Error, TMeta = undefined>(action: unknown): action is ErrorFSA<TCustomError, TMeta> {
    return isFluxAction(action) && action.error === true;
}

function isValidKey(key: string): boolean {
    return ["type", "payload", "error", "meta"].indexOf(key) > -1;
}
