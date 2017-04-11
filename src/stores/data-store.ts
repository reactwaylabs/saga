import * as Immutable from "immutable";
import * as Flux from "flux";

import { DispatcherMessage } from "../dispatcher";
import { ReduceStore } from "./reduce-store";
import { QueuesHandler } from "../handlers/queues-handler";

import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import { Items } from "../contracts/items";
import { StoreUpdateAction } from "../actions/data-store-actions";


export abstract class DataStore extends ReduceStore<Items<any>> {
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
        this.queues = new QueuesHandler<any>();
    }

    /**
     * Queues list.
     *
     */
    private queues: QueuesHandler<any>;

    /**
     * Start resolving promise and resolving item by key.
     *
     * @param key {string} - Item key.
     * @param promiseFactory {()=> Promise<TValue>} - Function which return a promise.
     */
    private async startRequestingData<TValue>(key: string, promiseFactory: () => Promise<TValue>) {
        try {
            let response = await promiseFactory();
            let status = (response != null) ? ItemStatus.Loaded : ItemStatus.NoData;
            this.queues.Set(key, response || undefined, status);
        } catch (error) {
            this.queues.SetItemStatus(key, ItemStatus.Failed);
        }
        this.getDispatcher().dispatch(new StoreUpdateAction(this.getDispatchToken()));
    }

    /**
     * Return specified item value.
     * Create new item in queues if not exists in store state.
     *
     * @param key {string} - Item key.
     * @param noCache {boolean} - Update cached item from the server.
     */
    private getItem<TValue>(key: string, noCache: boolean): Item<TValue> {
        if (key != null && this.has(key) && !noCache) {
            return this.getState().get(key);
        }
        if (this.queues.Has(key)) {
            return this.queues.Get(key)!;
        }
        return this.queues.Create(key);
    }

    /**
     * Move completed items from queues to state.
     *
     * @param state {Item<any>} - Current store state.
     */
    private moveFromQueuesToState(state: Items<any>): Items<any> | undefined {
        let moveList = this.queues.GetFilteredItems(x => x.Status >= ItemStatus.Loaded);
        if (moveList.size === 0) {
            return;
        }
        let keysForRemove = new Array<string>(moveList.size);
        let newState = state.withMutations(mutableState => {
            moveList.forEach((item, key) => {
                if (item == null || key == null) {
                    return;
                }
                mutableState.set(key, item);
                keysForRemove.push(key);
            });
        });

        this.queues.RemoveMultiple(keysForRemove);
        return newState;
    }

    /**
     * Return specified item value.
     * Start resolving data with `promiseFactory`.
     *
     * @param {string} key - Item key.
     * @param {() => Promise<TValue>} promiseFactory - Function which return promise with value resolver.
     * @param {boolean} [noCache=false] - Use data without cache.
     */
    protected GetValueFromState<TValue>(
        key: string, promiseFactory: () => Promise<TValue>, noCache: boolean = false): Item<TValue> {
        let value = this.getItem<TValue>(key, noCache);
        if (value.Status === ItemStatus.Init) {
            value = this.queues.SetItemStatus(key, ItemStatus.Pending);
            this.startRequestingData(key, promiseFactory);
        }
        return value;
    }

    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     */
    getInitialState(): Items<any> {
        return Immutable.Map<string, Item<any>>({});
    }


    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state {Items<any>} - Current store state.
     * @param payload {DispatcherMessage<any>} - Dispatched message from dispatcher.
     */
    reduce(state: Items<any>, payload: DispatcherMessage<any>): Items<any> {
        if (payload.action instanceof StoreUpdateAction) {
            if (this.getDispatchToken() === payload.action.DispatchToken) {
                let newState = this.moveFromQueuesToState(state);
                if (newState != null) {
                    state = newState;
                }
            }
        } else {
            state = super.reduce(state, payload);
        }
        return state;
    }

    /**
     * Check if the cache has a particular key.
     *
     * @param key {string} - Item key.
     */
    protected has(key: string): boolean {
        return this.getState().has(key);
    }
}
