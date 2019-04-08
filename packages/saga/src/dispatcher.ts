import { generateRandomString } from "./helpers";
import { DispatcherRegisterHandler, Dispatcher, DispatcherMiddleware } from "./contracts";
import { isClassAction, createSagaAction } from "./actions";

const RANDOM_ID: string = generateRandomString();

interface ListenerItem<TPayload> {
    callback: DispatcherRegisterHandler<TPayload>;
    isHandled: boolean;
    isPending: boolean;
}

class DispatcherClass<TPayload> implements Dispatcher<TPayload> {
    private listeners: { [dispatchToken: string]: ListenerItem<TPayload> | undefined } = {};
    private _isDispatching: boolean = false;
    private pendingPayload?: TPayload;

    private listenerCounter: number = 0;

    public register(callback: (payload: TPayload) => void): string {
        const listenerId: string = `_${RANDOM_ID}_${this.listenerCounter++}`;

        this.listeners[listenerId] = {
            callback: callback,
            isHandled: false,
            isPending: false
        };

        return listenerId;
    }

    public unregister(dispatchToken: string): void {
        this.listeners[dispatchToken] = undefined;
    }

    public waitFor(dispatchTokens: string[]): void {
        if (!this.isDispatching) {
            throw new Error("Dispatcher.waitFor(...): Must be invoked while dispatching.");
        }

        for (const id of dispatchTokens) {
            const listener = this.listeners[id];
            if (listener == null) {
                throw new Error(`Dispatcher.waitFor(...): Listener "${id}" does not exist.`);
            }

            if (listener.isPending) {
                throw new Error(`Dispatcher.waitFor(...): Circular dependency detected while waiting for ${id}.`);
            }

            this.invokeCallback(listener);
        }
    }

    public dispatch(payload: TPayload): void {
        if (this._isDispatching) {
            throw new Error("Dispatch.dispatch(...): Cannot dispatch in the middle of dispatch.");
        }

        this.startDispatching(payload);
        try {
            for (const id of Object.keys(this.listeners)) {
                const listener = this.listeners[id];
                if (listener == null || listener.isPending) {
                    continue;
                }

                this.invokeCallback(listener);
            }
        } finally {
            this.stopDispatching();
        }
    }

    public get isDispatching(): boolean {
        return this._isDispatching;
    }

    private invokeCallback(listener: ListenerItem<TPayload>): void {
        if (this.pendingPayload == null) {
            return;
        }

        listener.isPending = true;
        listener.callback(this.pendingPayload);
        listener.isHandled = true;
    }

    private startDispatching(payload: TPayload): void {
        for (const id of Object.keys(this.listeners)) {
            const listener = this.listeners[id];
            if (listener == null) {
                continue;
            }

            listener.isPending = false;
            listener.isHandled = false;
        }
        this.pendingPayload = payload;
        this._isDispatching = true;
    }

    private stopDispatching(): void {
        this.pendingPayload = undefined;
        this._isDispatching = false;
    }
}

export function createDispatcher<TPayload = unknown>(
    middlewares?: Array<DispatcherMiddleware<Dispatcher<TPayload>>>
): Dispatcher<TPayload> {
    let dispatcher: Dispatcher<TPayload> = new DispatcherClass<TPayload>();

    dispatcher = classActionsMiddleware(dispatcher);

    if (middlewares != null) {
        for (const middleware of middlewares) {
            dispatcher = middleware(dispatcher);
        }
    }

    return dispatcher;
}

const classActionsMiddleware: DispatcherMiddleware<Dispatcher> = dispatcher => {
    const originalDispatch = dispatcher.dispatch.bind(dispatcher);

    const classActionsDispatch = (payload: unknown) => {
        if (isClassAction(payload)) {
            const sagaAction = createSagaAction(payload);
            originalDispatch(sagaAction);
        } else {
            originalDispatch(payload);
        }
    };

    dispatcher.dispatch = classActionsDispatch;

    return dispatcher;
};

export const AppDispatcher = createDispatcher();
