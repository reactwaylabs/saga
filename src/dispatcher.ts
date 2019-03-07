export interface Action {
    type: string;
}

export interface StoreItem<TPayload> {
    callback: (payload: TPayload) => void;
    isHandled: boolean;
    isPending: boolean;
}

export interface IDispatcher<TPayload> {
    register(name: string, callback: (payload: TPayload) => void): void;
    unregister(name: string): void;
    waitFor(names: string[]): void;
    dispatch(payload: TPayload): void;
    isDispatching: boolean;
}
