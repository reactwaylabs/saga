import { ReduceStore } from "simplr-flux";
import {
    CountDownAction,
    CountUpAction,
    ResetCountAction,
    CountChangedAction
} from "./counter-actions";

interface StoreState {
    Count: number;
}

class CounterReduceStoreClass extends ReduceStore<StoreState> {
    constructor() {
        super();
        this.registerAction(CountDownAction, this.onCountDown.bind(this));
        this.registerAction(CountUpAction, this.onCountUp.bind(this));
        this.registerAction(ResetCountAction, this.onResetCount.bind(this));
        this.registerAction(CountChangedAction, this.onCountChanged.bind(this));
    }

    private onCountDown(action: CountDownAction, state: StoreState): StoreState {
        return {
            Count: state.Count - 1
        };
    }

    private onCountUp(action: CountUpAction, state: StoreState): StoreState {
        return {
            Count: state.Count + 1
        };
    }

    private onResetCount(action: ResetCountAction, state: StoreState): StoreState {
        return this.getInitialState();
    }

    private onCountChanged(action: CountChangedAction, state: StoreState): StoreState {
        return {
            Count: action.Count
        };
    }

    getInitialState(): StoreState {
        return {
            Count: 0
        };
    }

    public get Count(): number {
        return this.getState().Count;
    }
}

export const CounterReduceStore = new CounterReduceStoreClass();
