import * as flux from "flux";

export interface DispatcherMessage<TAction> {
    action: TAction;
}

export class DispatcherBuilder extends flux.Dispatcher<DispatcherMessage<any>> {
    /**
     * Dispatches a payload to all registered callbacks.
     *
     * @param dispatcherMessage {TAction} Instance of class.
     */
    public dispatch<TAction>(actionClass: TAction): void {
        let payload: DispatcherMessage<TAction> = {
            action: actionClass
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

export const Dispatcher = new DispatcherBuilder();
