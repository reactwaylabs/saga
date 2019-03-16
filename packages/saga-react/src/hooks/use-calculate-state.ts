import { useState, useEffect, useCallback, DependencyList } from "react";
import { Store } from "saga";

export type CalculcateStateHandler<TState> = (prevState?: TState) => TState;

export function useCalculateState<TState>(
    _callback: CalculcateStateHandler<TState>,
    storesDependencies: Array<Store<any>>,
    deps: DependencyList = [],
    initialState?: TState
): TState {
    const callback = useCallback(_callback, deps);

    const [state, setState] = useState<TState>(callback(initialState));

    useEffect(() => {
        const unsubscribeCallbacks: Array<() => void> = [];

        const storeSubscriber = () => {
            setState(callback(state));
        };

        for (const store of storesDependencies) {
            unsubscribeCallbacks.push(store.subscribe(storeSubscriber));
        }

        return () => {
            for (const unsubscribe of unsubscribeCallbacks) {
                unsubscribe();
            }
        };
    }, [...storesDependencies, callback]);

    return state;
}
