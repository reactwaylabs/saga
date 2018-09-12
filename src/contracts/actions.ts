export interface FluxAction {
    type: string;
}

export interface SimplrAction<TAction = any> extends FluxAction {
    type: "SIMPLR_ACTION";
    action: TAction;
}

export type DispatcherMessage<TAction = any> = FluxAction | SimplrAction<TAction>;
