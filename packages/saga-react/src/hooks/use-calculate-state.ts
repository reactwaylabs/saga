import { useState, useEffect } from "react";
import { Store } from "saga";

export type CalculcateStateHandler<TState> = (prevState?: TState) => TState;

export function useCalculateState<TState>(
    callback: CalculcateStateHandler<TState>,
    storeDependencies: Array<Store<any>>,
    initialState?: TState
): TState {
    const [state, setState] = useState<TState>(callback(initialState));

    useEffect(() => {
        const unsubscribeCallbacks: Array<() => void> = [];

        const storeSubscriber = () => {
            setState(callback(state));
        };

        for (const store of storeDependencies) {
            unsubscribeCallbacks.push(store.subscribe(storeSubscriber));
        }

        return () => {
            for (const unsubscribe of unsubscribeCallbacks) {
                unsubscribe();
            }
        };
    }, [...storeDependencies, callback]);

    return state;
}
