import { Dispatcher } from "saga";

import { ActionsBundle, isActionsBundle } from "./actions-bundle";

export function withActionsBundle<TPayload>(dispatcher: Dispatcher<TPayload>): Dispatcher<TPayload | ActionsBundle> {
    const dispatch = dispatcher.dispatch;

    dispatcher.dispatch = payload => {
        if (isActionsBundle(payload)) {
            payload.dispatch(dispatch);
        } else {
            dispatch(payload);
        }
    };

    return dispatcher as Dispatcher<TPayload | ActionsBundle>;
}
