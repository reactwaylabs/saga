import * as flux from "flux";

export interface DispatcherMessage<TAction> {
    action: TAction;
}

export class DispatcherClass extends flux.Dispatcher<DispatcherMessage<any>> {
    /**
     * Dispatches a payload to all registered callbacks.
     *
     * @param {TAction} dispatcherMessage - Instance of a class.
     */
    public dispatch<TAction>(dispatcherMessage: TAction): void {
        const payload: DispatcherMessage<TAction> = {
            action: dispatcherMessage
        };
        try {
            if (!this.isDispatching()) {
                super.dispatch(payload);
            } else {
                throw new Error("SimplrFlux.Dispatcher.dispatch(): Cannot dispatch in the middle of a dispatch.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export const Dispatcher = new DispatcherClass();
