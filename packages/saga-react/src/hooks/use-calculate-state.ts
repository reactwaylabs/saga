import { useState, useEffect, useCallback, DependencyList } from "react";
import { Store } from "saga";

export type CalculcateStateHandler<TState> = (prevState?: TState) => TState;

/**
 * A hook that subscribes to stores and on every change calls callback to calculate newest state.
 * @param _callback Callback that will be called when any of stores emits change.
 * @param storesDependencies Stores list to listen to changes.
 * @param deps Callback dependencies.
 * @param initialState An object is given in callback at first call.
 */
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
