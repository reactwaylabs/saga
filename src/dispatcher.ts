export type DispatcherRegisterHandler<TPayload> = (payload: TPayload) => void;

export interface Dispatcher<TPayload> {
    register(name: string, callback: DispatcherRegisterHandler<TPayload>): void;
    unregister(name: string): void;
    waitFor(names: string[]): void;
    dispatch(payload: TPayload): void;
    isDispatching: boolean;
}

interface StoreItem<TPayload> {
    callback: (payload: TPayload) => void;
    isHandled: boolean;
    isPending: boolean;
}

class DispatcherClass<TPayload> implements Dispatcher<TPayload> {
    private stores: { [name: string]: StoreItem<TPayload> | undefined } = {};
    private _isDispatching: boolean = false;
    private pendingPayload?: TPayload;

    public register(name: string, callback: (payload: TPayload) => void): void {
        this.stores[name] = {
            callback: callback,
            isHandled: false,
            isPending: false
        };
    }

    public unregister(name: string): void {
        this.stores[name] = undefined;
    }

    public waitFor(names: string[]): void {
        if (!this.isDispatching) {
            throw new Error("Dispatcher.waitFor(...): Must be invoked while dispatching.");
        }

        for (const name of names) {
            const store = this.stores[name];
            if (store == null) {
                throw new Error(`Dispatcher.waitFor(...): Store "${name}" must be initialized first.`);
            }

            if (store.isPending) {
                throw new Error(`Dispatcher.waitFor(...): Circular dependency detected while waiting for ${name}.`);
            }

            this.invokeCallback(store);
        }
    }

    public dispatch(payload: TPayload): void {
        if (this._isDispatching) {
            throw new Error("Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.");
        }

        this.startDispatching(payload);
        try {
            for (const name of Object.keys(this.stores)) {
                const store = this.stores[name];
                if (store == null || store.isPending) {
                    continue;
                }

                this.invokeCallback(store);
            }
        } finally {
            this.stopDispatching();
        }
    }

    public get isDispatching(): boolean {
        return this._isDispatching;
    }

    private invokeCallback(store: StoreItem<TPayload>): void {
        if (this.pendingPayload == null) {
            return;
        }

        store.isPending = true;
        store.callback(this.pendingPayload);
        store.isHandled = true;
    }

    private startDispatching(payload: TPayload): void {
        for (const name of Object.keys(this.stores)) {
            const store = this.stores[name];
            if (store == null) {
                continue;
            }

            store.isPending = false;
            store.isHandled = false;
        }
        this.pendingPayload = payload;
        this._isDispatching = true;
    }

    private stopDispatching(): void {
        this.pendingPayload = undefined;
        this._isDispatching = false;
    }
}

export function createDispatcher<TPayload>(): Dispatcher<TPayload> {
    return new DispatcherClass<TPayload>();
}
