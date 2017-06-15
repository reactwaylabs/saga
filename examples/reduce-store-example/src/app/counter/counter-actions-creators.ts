import { Dispatcher } from "simplr-flux";
import {
    CountUpAction,
    CountDownAction,
    ResetCountAction,
    CountChangedAction
} from "./counter-actions";

export namespace CounterActionsCreators {
    export function CountUp() {
        Dispatcher.dispatch(new CountUpAction);
    }

    export function CountDown() {
        Dispatcher.dispatch(new CountDownAction);
    }

    export function ResetCount() {
        Dispatcher.dispatch(new ResetCountAction);
    }

    export function CountChanged(count: number) {
        Dispatcher.dispatch(new CountChangedAction(count));
    }
}
