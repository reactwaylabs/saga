import { ReduceStore } from "simplr-flux";
import {
    CountDecrementedAction,
    CountIncrementedAction,
    CountResetAction,
    CountChangedAction
} from "./counter-actions";

interface StoreState {
    Count: number;
}

class CounterReduceStoreClass extends ReduceStore<StoreState> {
    constructor() {
        super();
        this.registerAction(CountDecrementedAction, this.onCountDecremented.bind(this));
        this.registerAction(CountIncrementedAction, this.onCountIncremented.bind(this));
        this.registerAction(CountResetAction, this.onCountReset.bind(this));
        this.registerAction(CountChangedAction, this.onCountChanged.bind(this));
    }

    private onCountDecremented(action: CountDecrementedAction, state: StoreState): StoreState {
        return {
            Count: state.Count - 1
        };
    }

    private onCountIncremented(action: CountIncrementedAction, state: StoreState): StoreState {
        return {
            Count: state.Count + 1
        };
    }

    private onCountReset(action: CountResetAction, state: StoreState): StoreState {
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
