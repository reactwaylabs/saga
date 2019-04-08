// tslint:disable:no-any

// #region Actions

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

// #endregion

// #region Dispatcher

export type DispatcherRegisterHandler<TPayload = FSA> = (payload: TPayload) => void;

export interface Dispatcher<TPayload = any> {
    register(callback: DispatcherRegisterHandler<TPayload>): string;
    unregister(dispatchToken: string): void;
    waitFor(dispatchTokens: string[]): void;
    dispatch<TDPayload extends TPayload>(payload: TDPayload): void;
    isDispatching: boolean;
}

export type DispatchHandler = (payload: unknown) => void;

export type DispatcherMiddleware = (next: DispatchHandler, dispatch: DispatchHandler) => DispatchHandler;

// #endergion

// #region Utils

export interface AnyObject {
    [key: string]: unknown | AnyObject | undefined;
}

// #endregion
