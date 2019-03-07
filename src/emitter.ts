type Callback = (...args: any[]) => void;

interface Events {
    [type: string]: Callback;
}

export class TinyEmitter<TEvents extends Events> {
    protected callbacks: { [type: string]: Callback | Callback[] | undefined } = {};

    public addEventListener<TType extends keyof TEvents>(type: TType, handler: TEvents[TType]): () => void {
        const callbacks = this.callbacks[type as string];
        if (callbacks == null) {
            this.callbacks[type as string] = handler;
        } else if (Array.isArray(callbacks)) {
            callbacks.push(handler);
        } else {
            this.callbacks[type as string] = [callbacks, handler];
        }

        return () => {
            this.removeEventListener(type, handler);
        };
    }

    public removeEventListener<TType extends keyof TEvents>(type: TType, handler: TEvents[TType]): void {
        const callbacks = this.callbacks[type as string];
        if (callbacks == null) {
            return;
        }

        if (Array.isArray(callbacks)) {
            const nextArray: Callback[] = [];

            for (let i = 0; i < callbacks.length; i++) {
                const callback = callbacks[i];
                if (callback !== handler) {
                    nextArray.push(handler);
                }
            }

            this.callbacks[type as string] = nextArray;
        } else {
            this.callbacks[type as string] = undefined;
        }
    }

    public emit<TType extends keyof TEvents>(type: TType, ...payload: Parameters<TEvents[TType]>): void {
        const callbacks = this.callbacks[type as string];

        if (callbacks == null) {
            return;
        }

        if (Array.isArray(callbacks)) {
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i](...payload);
            }
        } else {
            callbacks(...payload);
        }
    }

    public getCount<TType extends keyof TEvents>(type: TType): number {
        const callbacks = this.callbacks[type as string];

        if (callbacks == null) {
            return 0;
        } else if (Array.isArray(callbacks)) {
            return callbacks.length;
        } else {
            return 1;
        }
    }
}
