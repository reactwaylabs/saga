import * as Immutable from "immutable";
import * as Flux from "flux";

import { DispatcherMessage } from "../dispatcher";
import { ReduceStore } from "./reduce-store";
import { QueuesHandler } from "../handlers/queues-handler";

import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import { Items } from "../contracts/items";
import { StoreUpdateAction } from "../actions/data-store-actions";
import { InvalidationHandler } from "../handlers/invalidation-handler";


export abstract class DataStore extends ReduceStore<Items<any>> {
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
        this.queuesHandler = new QueuesHandler<any>();
        this.invalidationHandler = new InvalidationHandler<string>();
    }

    /**
     * Queues list handler.
     *
     */
    private queuesHandler: QueuesHandler<any>;

    /**
     * State cache invalidation handler.
     *
     */
    private invalidationHandler: InvalidationHandler<string>;

    /**
     * Dispatch action that this store has changed.
     */
    private dispatchChanges(): void {
        this.getDispatcher().dispatch(new StoreUpdateAction(this.getDispatchToken()));
    }

    /**
     * Asyncronously dispatch action that this store has changed.
     * Dispatch process will be cancelled if specified `stillValid` method return false.
     *
     * @param {()=> void} stillValid - Is dispatch still valid.
     */
    private dispatchChangesAsync(stillValid?: () => boolean): void {
        setTimeout(() => {
            if (stillValid == null || stillValid()) {
                this.dispatchChanges();
            }
        });
    }

    /**
     * Start resolving promise and resolving item by key.
     *
     * @param {string} key - Item key.
     * @param {()=> Promise<TValue>} promiseFactory - Function which return a promise.
     */
    private async startRequestingData<TValue>(key: string, promiseFactory: () => Promise<TValue>) {
        try {
            let response = await promiseFactory();
            let status = (response != null) ? ItemStatus.Loaded : ItemStatus.NoData;
            this.queuesHandler.Set(key, response || undefined, status);
        } catch (error) {
            this.queuesHandler.SetItemStatus(key, ItemStatus.Failed);
        }
        this.dispatchChanges();
    }

    /**
     * Return specified item value.
     * Create new item in queues if not exists in store state.
     *
     * @param {string} key - Item key.
     * @param {boolean} noCache - Update cached item from the server.
     */
    private getItem<TValue>(key: string, noCache: boolean): Item<TValue> {
        if (key != null && this.has(key) && !noCache) {
            return this.getState().get(key);
        }
        if (this.queuesHandler.Has(key)) {
            return this.queuesHandler.Get(key)!;
        }
        return this.queuesHandler.Create(key);
    }

    /**
     * Move completed items from queues to state.
     *
     * @param {Item<any>} state - Current store state.
     */
    private moveFromQueuesToState(state: Items<any>): Items<any> | undefined {
        let moveList = this.queuesHandler.GetFilteredItems(x => x.Status >= ItemStatus.Loaded);
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

        this.queuesHandler.RemoveMultiple(keysForRemove);
        return newState;
    }

    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     *
     */
    getInitialState(): Items<any> {
        return Immutable.Map<string, Item<any>>({});
    }

    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param {Items<any>} state - Current store state.
     * @param {DispatcherMessage<any>} payload - Dispatched message from dispatcher.
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

        if (this.invalidationHandler.IsWaiting) {
            state = this.invalidationHandler.Start(state);
        }

        return state;
    }

    /**
     * Return specified item value.
     * Start resolving data with `promiseFactory`.
     *
     * @param {string} key - Item key.
     * @param {() => Promise<TValue>} promiseFactory - Function which return promise with value resolver.
     * @param {boolean} [noCache=false] - Use data without cache.
     */
    protected getValueFromState<TValue>(
        key: string, promiseFactory: () => Promise<TValue>, noCache: boolean = false): Item<TValue> {
        let value = this.getItem<TValue>(key, noCache);
        if (value.Status === ItemStatus.Init) {
            value = this.queuesHandler.SetItemStatus(key, ItemStatus.Pending);
            this.startRequestingData(key, promiseFactory);
        }
        return value;
    }

    /**
     * Check if the cache has a particular key.
     *
     * @param {string} key - Item key.
     */
    protected has(key: string): boolean {
        return this.getState().has(key);
    }

    /**
     * Remove item from cache, if exist.
     *
     * @param {string} key - Item key.
     */
    protected invalidateCache(key: string): void {
        this.invalidateCacheMultiple([key]);
    }

    /**
     * Remove multiple items from cache, if exist.
     *
     * @param {Array<string>} keys - Items keys.
     */
    protected invalidateCacheMultiple(keys: Array<string>): void {
        if (keys.length > 0) {
            this.invalidationHandler.Prepare(keys);
            this.dispatchChangesAsync(() => this.invalidationHandler.IsWaiting);
        }
    }
}
