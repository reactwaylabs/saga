import { Dispatcher } from "simplr-flux";
import {
    CountIncrementedAction,
    CountDecrementedAction,
    CountResetAction,
    CountChangedAction
} from "./counter-actions";

export namespace CounterActionsCreators {
    export function CountIncremented() {
        Dispatcher.dispatch(new CountIncrementedAction);
    }

    export function CountDecremented() {
        Dispatcher.dispatch(new CountDecrementedAction);
    }

    export function CountReset() {
        Dispatcher.dispatch(new CountResetAction);
    }

    export function CountChanged(count: number) {
        Dispatcher.dispatch(new CountChangedAction(count));
    }
}
