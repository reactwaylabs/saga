import { useState, useEffect } from "react";
import { Store } from "saga";

export function useStore<TStoreState>(store: Store<TStoreState>): TStoreState {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
        const callback = () => {
            setState(store.getState());
        };
        const unsubscribe = store.subscribe(callback);

        return () => unsubscribe();
    }, [store]);

    return state;
}
