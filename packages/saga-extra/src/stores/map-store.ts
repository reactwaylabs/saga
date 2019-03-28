import { useEffect } from "react";
import { createStore, Dispatcher, StoreReduceHandler, StoreAreEqualHandler, createAction, combineHandlers, Store } from "saga";
import { useDispatcher, useStore } from "saga-react";
import { produce, Draft } from "immer";

import { Item } from "../contracts";

export interface MapStoreActionMeta {
    uniqueId: string;
}

export interface MapStoreFetchAction {
    type: "MAP_STORE_FETCH";
    payload: string[];
    meta: MapStoreActionMeta;
}

export interface MapStoreUpdateAction<TItem> {
    type: "MAP_STORE_UPDATE";
    payload: MapStoreItems<TItem>;
    meta: MapStoreActionMeta;
}

export interface MapStoreInvalidateAction {
    type: "MAP_STORE_INVALIDATE";
    payload: string[];
    meta: MapStoreActionMeta;
}

export type MapStoreItems<TItem> = { [key: string]: Item<TItem> | undefined };

export interface MapStoreState<TItem> {
    items: MapStoreItems<TItem>;
}

export interface MapStoreOptions<TItem> {
    name: string;
    dispatcher?: Dispatcher;
    requestData: (ids: string[]) => Promise<MapStoreItems<TItem>>;
    reducer?: StoreReduceHandler<MapStoreState<TItem>>;
    areEqual?: StoreAreEqualHandler<MapStoreState<TItem>>;
}

let counter: number = 0;

export interface MapStoreHandler<TItem> {
    store: Store<MapStoreState<TItem>>;
    actionCreators: {
        fetch: (ids: string[]) => MapStoreFetchAction;
        update: (items: MapStoreItems<TItem>) => MapStoreUpdateAction<TItem>;
        invalidate: (ids: string[]) => MapStoreInvalidateAction;
    };
}

export function createMapStore<TItem>(options: MapStoreOptions<TItem>): MapStoreHandler<TItem> {
    const mapStoreId: string = `MAP_STORE_${counter++}`;

    const actionCreators = {
        fetch: (ids: string[]) => createAction<MapStoreFetchAction, MapStoreActionMeta>("MAP_STORE_FETCH", ids, { uniqueId: mapStoreId }),
        update: (items: MapStoreItems<TItem>) =>
            createAction<MapStoreUpdateAction<TItem>, MapStoreActionMeta>("MAP_STORE_UPDATE", items, { uniqueId: mapStoreId }),
        invalidate: (ids: string[]) =>
            createAction<MapStoreInvalidateAction, MapStoreActionMeta>("MAP_STORE_INVALIDATE", ids, { uniqueId: mapStoreId })
    };

    const requestData = async (ids: string[]) => {
        try {
            const result = await options.requestData(ids);
            actionCreators.update(result);
        } catch (error) {
            actionCreators.update(error);
        }
    };

    const mapStoreReducer: StoreReduceHandler<
        MapStoreState<TItem>,
        MapStoreFetchAction | MapStoreUpdateAction<TItem> | MapStoreInvalidateAction
    > = (state, action) => {
        if (action.meta != null && action.meta.uniqueId !== mapStoreId) {
            return state;
        }

        switch (action.type) {
            case "MAP_STORE_FETCH": {
                requestData(action.payload);
                return state;
            }
            case "MAP_STORE_UPDATE": {
                return produce(state, draft => {
                    for (const key of Object.keys(action.payload)) {
                        const item = action.payload[key];

                        if (item == null) {
                            continue;
                        }

                        draft.items[key] = item as Draft<Item<TItem>>;
                    }
                });
            }
            case "MAP_STORE_INVALIDATE": {
                return produce(state, draft => {
                    for (const key of action.payload) {
                        draft.items[key] = undefined;
                    }
                });
            }
        }

        return state;
    };

    const store = createStore<MapStoreState<TItem>>({
        ...options,
        initialState: { items: {} },
        reducer: combineHandlers([mapStoreReducer, options.reducer])
    });

    return {
        store: store,
        actionCreators: actionCreators
    };
}

export function useMapStore<TItem>(store: MapStoreHandler<TItem>, ids: string[]) {
    const state = useStore(store.store);
    const dispatcher = useDispatcher();

    useEffect(() => {
        dispatcher.dispatch(store.actionCreators.fetch(ids));
    }, [ids]);

    return state;
}
