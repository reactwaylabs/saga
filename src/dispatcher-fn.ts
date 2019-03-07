import { IDispatcher, StoreItem } from "./dispatcher";

export function createDispatcher<TPayload>(): IDispatcher<TPayload> {
    let stores: { [name: string]: StoreItem<TPayload> | undefined } = {};
    let isDispatching: boolean = false;

    let pendingPayload: TPayload | undefined;

    const invokeCallback = (store: StoreItem<TPayload>): void => {
        if (pendingPayload == null) {
            return;
        }

        store.isPending = true;
        store.callback(pendingPayload);
        store.isHandled = true;
    };

    return {
        register: (name, callback) => {
            stores[name] = {
                callback: callback,
                isHandled: false,
                isPending: false
            };
        },
        unregister: name => {
            stores[name] = undefined;
        },
        get isDispatching() {
            return isDispatching;
        },
        dispatch: payload => {
            if (!isDispatching) {
                throw new Error("Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.");
            }

            for (const name of Object.keys(stores)) {
                const store = stores[name];
                if (store == null) {
                    continue;
                }

                store.isPending = false;
                store.isHandled = false;
            }
            pendingPayload = payload;
            isDispatching = true;

            try {
                for (const name of Object.keys(stores)) {
                    const store = stores[name];
                    if (store == null) {
                        continue;
                    }

                    invokeCallback(store);
                }
            } finally {
                pendingPayload = undefined;
                isDispatching = false;
            }
        },
        waitFor: names => {
            if (!isDispatching) {
                throw new Error("Dispatcher.waitFor(...): Must be invoked while dispatching.");
            }

            for (const name of names) {
                const store = stores[name];
                if (store == null) {
                    throw new Error(`Dispatcher.waitFor(...): Store "${name}" must be initialized first.`);
                }

                if (store.isPending) {
                    throw new Error(`Dispatcher.waitFor(...): Circular dependency detected while waiting for ${name}.`);
                }

                invokeCallback(store);
            }
        }
    };
}
