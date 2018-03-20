import * as Immutable from "immutable";
import * as Flux from "flux";

import { DispatcherMessage } from "../dispatcher";
import { ReduceStore } from "./reduce-store";
import { QueuesHandler } from "../handlers/queues-handler";

import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import { Items } from "../contracts";
import { UpdateDataStoreAction } from "../actions/data-store-actions";
import { InvalidationBuffer } from "../handlers/invalidation-buffer";

export abstract class DataStore extends ReduceStore<Items<any>> {
    /**
     * Creates an instance of DataStore.
     *
     * @param dispatcher Dispatcher instance.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
        this.queuesHandler = new QueuesHandler<any>();
        this.invalidationHandler = new InvalidationBuffer<any>();
    }

    /**
     * Queues list handler.
     */
    private queuesHandler: QueuesHandler<any>;

    /**
     * State cache invalidation handler.
     */
    private invalidationHandler: InvalidationBuffer<any>;

    /**
     * Dispatch action that this store has changed.
     */
    private dispatchChanges(): void {
        this.getDispatcher().dispatch({
            action: new UpdateDataStoreAction(this.getDispatchToken())
        });
    }

    /**
     * Asynchronously dispatch action that this store has changed.
     * Dispatch process will be cancelled if specified `stillValid` method return false.
     *
     * @param stillValid Is dispatch still valid.
     */
    private dispatchChangesAsync(stillValid?: () => boolean): void {
        setTimeout(() => {
            if (stillValid == null || stillValid()) {
                this.dispatchChanges();
            }
        });
    }

    /**
     * Starts resolving promise and resolves item by key.
     *
     * @param key Item key.
     * @param promiseFactory Function returning a promise for value.
     */
    private async startRequestingData<TValue>(key: string, promiseFactory: () => Promise<TValue>): Promise<void> {
        try {
            const response = await promiseFactory();
            const status = response != null ? ItemStatus.Loaded : ItemStatus.NoData;
            this.queuesHandler.set(key, response || undefined, status);
        } catch (error) {
            this.queuesHandler.setItemStatus(key, ItemStatus.Failed);
        }
        this.dispatchChanges();
    }

    /**
     * Return specified item value.
     * Create new item in queues if not exists in store state.
     *
     * @param key Item key.
     * @param noCache Update cached item from the server.
     */
    private getItem<TValue>(key: string, noCache: boolean): Item<TValue> | undefined {
        if (key != null && this.has(key) && !noCache) {
            return this.getState().get(key);
        }
        if (this.queuesHandler.has(key)) {
            return this.queuesHandler.get(key)!;
        }
        this.queuesHandler.create(key);

        return this.queuesHandler.get(key);
    }

    /**
     * Move completed items from queues to state.
     *
     * @param state Current store state.
     */
    private moveFromQueuesToState(state: Items<any>): Items<any> | undefined {
        const moveList = this.queuesHandler.getFilteredItems(x => x.status >= ItemStatus.Loaded);
        if (moveList.size === 0) {
            return undefined;
        }
        const keysForRemove = new Array<string>(moveList.size);
        const newState = state.withMutations(mutableState => {
            let index = 0;
            moveList.forEach((item, key) => {
                if (item == null || key == null) {
                    return;
                }
                mutableState.set(key, item);
                keysForRemove[index++] = key;
            });
        });
        this.queuesHandler.removeMultiple(keysForRemove);
        return newState;
    }

    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     */
    public getInitialState(): Items<any> {
        return Immutable.Map<string, Item<any>>();
    }

    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state Current store state.
     * @param payload Dispatched message from dispatcher.
     */
    public reduce(state: Items<any>, payload: DispatcherMessage<any>): Items<any> {
        if (payload.action instanceof UpdateDataStoreAction) {
            if (this.getDispatchToken() === payload.action.dispatchToken) {
                const newState = this.moveFromQueuesToState(state);
                if (newState != null) {
                    state = newState;
                }
            }
        }

        state = super.reduce(state, payload);

        if (this.invalidationHandler.isWaiting) {
            const result = this.invalidationHandler.reduceEnqueuedInvalidations(state);
            this.queuesHandler.removeMultiple(result.removedKeys);
            state = result.state;
        }
        return state;
    }

    /**
     * Return specified item value.
     * Start resolving data with `promiseFactory`.
     *
     * @param key Item key.
     * @param promiseFactory Function which return promise with value resolver.
     * @param noCache Use data without cache.
     */
    protected getValueFromState<TValue>(
        key: string,
        promiseFactory: () => Promise<TValue>,
        noCache: boolean = false
    ): Item<TValue> | undefined {
        let value = this.getItem<TValue>(key, noCache);
        if (value == null) {
            return undefined;
        }
        if (value.status === ItemStatus.Init) {
            this.queuesHandler.setItemStatus(key, ItemStatus.Pending);
            value = this.queuesHandler.get(key);
            this.startRequestingData(key, promiseFactory);
        }
        return value;
    }

    /**
     * Check if the cache has a particular key.
     *
     * @param key Item key.
     */
    protected has(key: string): boolean {
        return this.getState().has(key);
    }

    /**
     * Remove item from cache, if exist.
     *
     * @param key Item key.
     */
    protected invalidateCache(key: string): void {
        this.invalidateCacheMultiple([key]);
    }

    /**
     * Remove multiple items from cache, if exist.
     *
     * @param keys Items keys.
     */
    protected invalidateCacheMultiple(keys: string[]): void {
        if (keys.length > 0) {
            this.invalidationHandler.enqueue(keys);
            this.dispatchChangesAsync(() => this.invalidationHandler.isWaiting);
        }
    }
}
