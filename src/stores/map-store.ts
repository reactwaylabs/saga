import * as Flux from "flux";
import * as Immutable from "immutable";
import { ReduceStore } from "./reduce-store";
import { DispatcherMessage, Dispatcher } from "../dispatcher";
import { DataMapStoreUpdatedAction } from "../actions/actions";

import { QueuesHandler } from "../handlers/queues-handler";

import { Item } from "../abstractions/item";
import { Items } from "../contracts/items";
import { ItemStatus } from "../abstractions/item-status";
import { InvalidationHandler } from "../handlers/invalidation-handler";
import { OnSuccess, OnFailure } from "../contracts/callbacks";

const ERROR_GET_ALL_WRONG_PARAM = "'keys' param accepts only 'Array<string>', 'Immutable.Set<string>' or 'Immutable.List<string>'.";

/**
 * MapStore to cache data by id.
 */
export abstract class MapStore<TValue> extends ReduceStore<Items<TValue>> {
    /**
     * Creates an instance of MapStore.
     *
     * @param dispatcher Dispatcher instance.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
        this.queuesHandler = new QueuesHandler<TValue>();
        this.invalidationHandler = new InvalidationHandler<TValue>();
    }

    //#region Properties

    /**
     * With a large amount of requests MapStore throttles them.
     * This property defines interval between portions of requests.
     */
    protected requestsIntervalInMs: number = 50;

    /**
     * Queues list pending for request.
     */
    private queuesHandler: QueuesHandler<TValue>;

    /**
     * State cache invalidation handler.
     */
    private invalidationHandler: InvalidationHandler<TValue>;

    private requestIntervalTimer: undefined | number;

    //#endregion

    //#region Helpers

    /**
     * Build error with prefix and class name.
     */
    private buildError(functionName: string, message: string): string {
        return `SimplrFlux.MapStore.${functionName}() [${this.constructor.name}]: ${message}`;
    }

    private dispatchChanges(): void {
        Dispatcher.dispatch(new DataMapStoreUpdatedAction(this.getDispatchToken()));
    }

    private dispatchChangesAsync(): void {
        setTimeout(() => {
            this.dispatchChanges();
        });
    }

    /**
     * Update queues items from request.
     */
    private updateQueuesFromRequest(values: { [id: string]: TValue | undefined }): void {
        Object.keys(values).forEach(key => {
            let value = values[key];
            let status: ItemStatus;
            if (value != null) {
                status = ItemStatus.Loaded;
            } else {
                value = undefined;
                status = ItemStatus.NoData;
            }
            this.queuesHandler.set(key, value, status);
        });
    }

    /**
     * Request creator to load data from server.
     */
    private createRequest(): void {
        // FIXME: DFQ
        if (this.requestIntervalTimer != null) {
            return;
        }

        setTimeout(() => {
            this.startRequestingData(true);
        });
        this.requestIntervalTimer = setTimeout(this.startRequestingData, this.requestsIntervalInMs);
    }

    private startRequestingData = (initial: boolean = false): void => {
        // FIXME: DFQ
        if (!initial) {
            this.requestIntervalTimer = undefined;
        }

        const ids = this.queuesHandler.getFilteredItemsKeys(item => item.status === ItemStatus.Init);
        if (ids.length === 0) {
            return;
        }

        // Save current session timestamp for checking if session changed while in an asynchronous context
        const currentSessionTimestamp = this.currentSessionTimestamp;

        this.queuesHandler.setMultipleItemsStatus(ids, ItemStatus.Pending);

        const onSuccess = this.onRequestSuccess.bind(this, currentSessionTimestamp);
        const onFailed = this.onRequestFailed.bind(this, currentSessionTimestamp, ids);

        this.requestData(ids, onSuccess, onFailed);
    };

    private onRequestSuccess = (currentSessionTimestamp: number, values: { [id: string]: TValue }) => {
        if (currentSessionTimestamp !== this.currentSessionTimestamp) {
            console.warn(
                this.buildError(
                    "requestData",
                    "RequestData method was resolved after store data has been cleared. Check `this.cleanUpStore()` method calls."
                )
            );
            return;
        }
        if (values == null) {
            console.error(this.buildError("requestData", `Success values cannot be '${values}'.`));
            return;
        }
        this.updateQueuesFromRequest(values);
        this.dispatchChanges();
    };

    private onRequestFailed = (currentSessionTimestamp: number, ids: string[], values?: { [id: string]: ItemStatus } | string[]) => {
        if (currentSessionTimestamp !== this.currentSessionTimestamp) {
            console.warn(
                this.buildError(
                    "requestData",
                    "RequestData method was rejected after store data has been cleared. Check `this.cleanUpStore()` method calls."
                )
            );
            return;
        }

        if (values == null) {
            this.queuesHandler.setMultipleItemsStatus(ids, ItemStatus.Failed);
        } else if (Array.isArray(values)) {
            this.queuesHandler.setMultipleItemsStatus(values, ItemStatus.Failed);
        } else if (typeof values === "object") {
            let isExistResults = false;
            const results: { [status: number]: string } = {};

            Object.keys(values).forEach(id => {
                const status = values[id];
                results[status] = id;
                if (!isExistResults) {
                    isExistResults = true;
                }
            });
            if (isExistResults) {
                Object.keys(results).forEach(status => {
                    this.queuesHandler.setMultipleItemsStatus(ids, parseInt(status));
                });
            } else {
                this.queuesHandler.setMultipleItemsStatus(ids, ItemStatus.Failed);
            }
        } else {
            this.queuesHandler.setMultipleItemsStatus(ids, ItemStatus.Failed);
        }

        this.dispatchChanges();
    };
    //#endregion

    /**
     * An abstract method to provide data for requested ids.
     *
     * @param ids List of requested ids.
     * @param onSuccess Callback to resolve some values.
     * @param onFailed Callback to reject some values.
     */
    protected abstract requestData(ids: string[], onSuccess?: OnSuccess<TValue>, onFailed?: OnFailure): Promise<void> | void;

    /**
     * Gets the value of a particular key and
     * returns Value: undefined and status:init if the key does not exist in the cache.
     *
     * @param key Requested item key.
     * @param noCache Should cached item be re-fetched from the server.
     */
    public get(key: string, noCache: boolean = false): Item<TValue> {
        const item = this.getItem(key, noCache);
        this.createRequest();
        return item;
    }

    /**
     * Invalidates item if it exists in the cache.
     *
     * @param key Item key to be invalidated.
     */
    public invalidateCache(keys: string | string[]): void {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        this.invalidationHandler.enqueue(keys);
        this.dispatchChangesAsync();
    }

    /**
     * Prefetch item by key.
     * @param key Requested item key.
     * @param noCache Should cached item be re-fetched from the server.
     */
    public prefetch(key: string, noCache: boolean = false): void {
        this.get(key, noCache);
    }

    /**
     * Returns item value from state or adds it to the queue to be requested.
     *
     * @param key Requested item key.
     * @param noCache Should cached item be re-fetched from the server.
     */
    private getItem(key: string, noCache: boolean): Item<TValue> {
        let item: Item<TValue>;
        if (key != null && this.getState().has(key) && !noCache) {
            const itemFromState = this.getState().get(key);
            if (itemFromState != null) {
                return itemFromState;
            }
        }
        if (!this.queuesHandler.has(key)) {
            this.queuesHandler.create(key);
        }
        item = this.queuesHandler.get(key)!;
        return item;
    }

    /**
     * Prefetch all items by keys.
     * @param keys Requested item keys.
     * @param noCache Should cached items be re-fetched from the server.
     */
    public prefetchAll(keys: string[], noCache?: boolean): void;
    public prefetchAll(keys: Immutable.List<string>, noCache?: boolean): void;
    public prefetchAll(keys: Immutable.Set<string>, noCache?: boolean): void;
    public prefetchAll(keys: Immutable.OrderedSet<string>, noCache?: boolean): void;
    public prefetchAll(keys: any, noCache: boolean = false): void {
        this.getAll(keys, undefined, noCache);
    }

    /**
     * Gets an array of keys and puts the values in a map if they exist, it allows
     * providing a previous result to update instead of generating a new map.
     *
     * Providing a previous result allows the possibility of keeping the same
     * reference if the keys did not change.
     *
     * @param keys Requested keys list in Array or Immutable List.
     * @param prev Previous data list merged with new data list.
     * @param noCache Update cached items from the server.
     */
    public getAll(keys: string[], prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.List<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.Set<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.OrderedSet<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(
        keys: string[] | Immutable.List<string> | Immutable.Set<string> | Immutable.OrderedSet<string>,
        prev?: Items<TValue>,
        noCache: boolean = false
    ): Items<TValue> {
        let newKeys: Immutable.Set<string>;
        const start = prev || this.getInitialState();

        if (keys != null) {
            if (keys instanceof Array) {
                // string[]
                try {
                    newKeys = Immutable.Set(keys);
                } catch (error) {
                    // FIXME: DFQ
                    console.error(this.buildError("getAll", ERROR_GET_ALL_WRONG_PARAM));
                    newKeys = Immutable.Set<string>();
                }
            } else if (Immutable.OrderedSet.isOrderedSet(keys)) {
                // Immutable.OrderedSet<string>
                newKeys = keys as Immutable.OrderedSet<string>;
            } else if (Immutable.Set.isSet(keys)) {
                // Immutable.Set<string>
                newKeys = keys as Immutable.Set<string>;
            } else if (Immutable.List.isList(keys)) {
                // Immutable.List<string>
                try {
                    newKeys = keys.toSet();
                } catch (error) {
                    // FIXME: DFQ
                    newKeys = Immutable.Set<string>();
                    console.error(this.buildError("getAll", ERROR_GET_ALL_WRONG_PARAM));
                }
            } else {
                console.error(this.buildError("getAll", ERROR_GET_ALL_WRONG_PARAM));
                newKeys = Immutable.Set<string>();
            }
        } else {
            newKeys = Immutable.Set<string>();
        }

        if (newKeys.size === 0) {
            return start;
        }

        return start.withMutations(resultMap => {
            // remove any old keys that are not in new keys or are no longer in the cache
            if (resultMap.size > 0) {
                resultMap.forEach((oldValue, oldKey) => {
                    if (oldKey != null && (!newKeys.has(oldKey) || !this.getState().has(oldKey))) {
                        resultMap.delete(oldKey);
                    }
                });
            }
            // then add all of the new keys that exist in the cache
            newKeys.forEach(key => {
                if (key != null) {
                    const item = this.getItem(key, noCache);
                    resultMap.set(key, item);
                }
            });
            this.createRequest();
        });
    }

    /**
     * Constructs the initial state for this store.
     * This is called once during construction of the store.
     *
     * @return Initial empty state.
     */
    public getInitialState(): Items<TValue> {
        return Immutable.Map<string, Item<TValue>>();
    }

    /**
     * Move completed items from queues to state.
     *
     * @param state
     */
    private moveFromQueuesToState(state: Items<TValue>): Items<TValue> | undefined {
        const moveList = this.queuesHandler.getFilteredItemsKeys(
            x => [ItemStatus.Loaded, ItemStatus.NoData, ItemStatus.Failed].indexOf(x.status) !== -1
        );
        if (moveList.length > 0) {
            return state.withMutations(stateMap => {
                for (let i = 0; i < moveList.length; i++) {
                    const key = moveList[i];
                    const item = this.queuesHandler.get(key);
                    if (item != null) {
                        stateMap.set(key, { ...item });
                    }
                    this.queuesHandler.remove(key);
                }
            });
        }
        return undefined;
    }

    /**
     * Holds a function that will be invoked before store clean up.
     */
    protected storeWillCleanUp: () => void = () => {
        this.queuesHandler.removeAll();
    };

    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state Store state.
     * @param payload Dispatched message from simplr-dispatcher.
     */
    public reduce(state: Items<TValue>, payload: DispatcherMessage<any>): Items<TValue> {
        if (payload.action instanceof DataMapStoreUpdatedAction) {
            if (this.getDispatchToken() === payload.action.storeId) {
                const newState = this.moveFromQueuesToState(state);
                if (newState != null) {
                    state = newState;
                }
            }
        }
        state = super.reduce(state, payload);

        if (this.invalidationHandler.isWaiting) {
            const result = this.invalidationHandler.processEnqueuedInvalidations(state);
            this.queuesHandler.removeMultiple(result.removedKeys);
            state = result.state;
        }

        return state;
    }

    /**
     * Returns the value at the given key.
     * Returns undefined if the key does not exist in the cache.
     */
    public at(key: string): Item<TValue> | undefined {
        if (this.getState().has(key)) {
            return this.get(key);
        } else if (this.queuesHandler.has(key)) {
            return this.queuesHandler.get(key);
        } else {
            console.error(this.buildError("at", `Expected store to have key ${key}.`));
            return undefined;
        }
    }

    /**
     * Checks whether the cache has a particular key.
     */
    public has(key: string): boolean {
        return this.getState().has(key) || this.queuesHandler.has(key);
    }
}
