import * as Flux from "flux";

export interface DispatcherMessage<TAction> {
    action: TAction;
}

export class DispatcherClass extends Flux.Dispatcher<DispatcherMessage<any>> {
    /**
     * Dispatches a payload to all registered callbacks.
     *
     * @param dispatcherMessage Payload with action as instance of a class.
     */
    public dispatch<TAction extends {}>(dispatcherMessage: DispatcherMessage<TAction>): void {
        super.dispatch(dispatcherMessage);
    }
}

export const Dispatcher = new DispatcherClass();
