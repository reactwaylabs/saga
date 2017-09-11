import * as React from "react";
import { Container } from "flux/utils";

import { CounterReduceStore } from "./counter-store";
import { CounterActionsCreators } from "./counter-actions-creators";

interface State {
    Count: number;
}

class CounterContainerClass extends React.Component<{}, State> {
    static getStores() {
        return [CounterReduceStore];
    }

    static calculateState(state: State): State {
        return {
            Count: CounterReduceStore.getState().Count
        };
    }

    private input: HTMLInputElement;

    private onIncrementClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        CounterActionsCreators.CountIncremented();
    }

    private onDecrementClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        CounterActionsCreators.CountDecremented();
    }

    private onResetClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        CounterActionsCreators.CountReset();
    }

    private onChangeClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        const value = Number(this.input.value);

        if (this.input.value.length === 0 || isNaN(value)) {
            alert("Hey! That's not a number!");
        } else {
            CounterActionsCreators.CountChanged(value);
        }
    }

    render() {
        return <div>
            <div>
                <span>{`Count is: ${this.state.Count} `}</span>
            </div>
            <div>
                <button onClick={this.onIncrementClick}>Increment</button>
                <button onClick={this.onDecrementClick}>Decrement</button>
                <button onClick={this.onResetClick}>Reset</button>
            </div>
            <div>
                <input ref={(input) => { this.input = input; }} defaultValue="25" />
                <button onClick={this.onChangeClick}>Change</button>
            </div>
        </div>;
    }
}

export const CounterContainer = Container.create(CounterContainerClass);
