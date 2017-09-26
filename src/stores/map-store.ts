import * as Flux from "flux";
import * as Immutable from "immutable";
import { ReduceStore } from "./reduce-store";
import { DispatcherMessage, Dispatcher } from "../dispatcher";
import { DataMapStoreUpdatedAction } from "../actions/actions";

import { QueuesHandler } from "../handlers/queues-handler";

import { Item } from "../abstractions/item";
import { Items } from "../abstractions/items";
import { ItemStatus } from "../abstractions/item-status";
import { InvalidationHandler } from "../handlers/invalidation-handler";
import { OnSuccess, OnFailure } from "../contracts/callbacks";

const ERROR_GET_ALL_WRONG_PARAM = "'keys' param accept only 'Array<string>', " +
    "'Immutable.Set<string>' or 'Immutable.List<string>'.";

/**
 * MapStore to cache data by id.
 *
 * @export
 * @abstract
 * @class MapStore
 * @extends {ReduceStore<Items<TValue>>}
 * @template TValue
 */
export abstract class MapStore<TValue> extends ReduceStore<Items<TValue>> {
    /**
     * Creates an instance of MapStore.
     *
     * @param {Flux.Dispatcher<DispatcherMessage<any>>} [dispatcher] - Dispatcher instance.
     */
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
        this.queuesHandler = this.getInitialQueues();
        this.invalidationHandler = new InvalidationHandler<TValue>();
    }

    /**
     * Return initial queues value.
     */
    private getInitialQueues = () => new QueuesHandler<TValue>();

    /**
     * State cache invalidation handler.
     *
     * @type {InvalidationHandler<TValue>}
     */
    private invalidationHandler: InvalidationHandler<TValue>;

    /**
     * Build error with prefix and instance name.
     *
     * @private
     * @param {string} functionName
     * @param {string} message
     * @returns {string}
     */
    private buildError(functionName: string, message: string): string {
        return `SimplrFlux.MapStore.${functionName}() [${this.constructor.name}]: ${message}`;
    }

    /**
     * Queues list pending for request.
     *
     * @private
     * @type {QueuesHandler<TValue>}
     */
    private queuesHandler: QueuesHandler<TValue>;

    private dispatchChanges() {
        Dispatcher.dispatch(new DataMapStoreUpdatedAction(this.getDispatchToken()));
    }

    private dispatchChangesAsync() {
        setTimeout(() => {
            this.dispatchChanges();
        });
    }

    /**
     * API call to get data from server.
     *
     * @param {string[]} ids - List of requesting ids.
     * @param {OnSuccess} [onSuccess] - Resolve some values.
     * @param {OnFailure} [onFailed] - Reject some values.
     * @return {Promise<Function>} Request response promise.
     */
    protected abstract requestData(
        ids: string[],
        onSuccess?: OnSuccess<TValue>,
        onFailed?: OnFailure
    ): Promise<{ [id: string]: TValue }> | void;

    /**
     * Update queues items from request.
     *
     * @private
     * @param {({ [id: string]: TValue | undefined })} values
     */
    private updateQueuesFromRequest(values: { [id: string]: TValue | undefined }): void {
        /* tslint:disable */
        for (let key in values) {
            let value = values[key];
            let status: ItemStatus;
            if (value != null) {
                status = ItemStatus.Loaded;
            } else {
                value = undefined;
                status = ItemStatus.NoData;
            }
            this.queuesHandler.Set(key, value, status);
        }
    }


    /**
     * Request creator to load data from server.
     *
     * @private
     */
    private createRequest(): void {
        if (this.requestIntervalTimer != null) {
            return;
        }

        setTimeout(() => {
            this.startRequestingData(true);
        });
        this.requestIntervalTimer = setTimeout(this.startRequestingData, this.RequestsIntervalInMs);
    }

    private requestIntervalTimer: undefined | number;

    /**
     * With a large amount of requests MapStore throttles them.
     * This property defines interval between portions of requests.
     * 
     * @protected
     * @type {number}
     */
    protected RequestsIntervalInMs: number = 50;

    private startRequestingData = (initial: boolean = false): void => {
        if (!initial) {
            this.requestIntervalTimer = undefined;
        }

        let ids = this.queuesHandler.GetFilteredItemsKeys(item => item.Status === ItemStatus.Init);
        if (ids.length === 0) {
            return;
        }

        let currentSession = this.currentSession;

        this.queuesHandler.SetMultipleItemsStatus(ids, ItemStatus.Pending);

        let onSuccess = this.onRequestSuccess.bind(this, currentSession);
        let onFailed = this.onRequestFailed.bind(this, currentSession, ids);

        let maybePromise = this.requestData(ids, onSuccess, onFailed);
        if (this.isPromise(maybePromise)) {
            maybePromise
                .then(onSuccess)
                .catch(error => {
                    this.queuesHandler.SetMultipleItemsStatus(ids, ItemStatus.Failed);
                    this.dispatchChanges();
                });
        }
    }

    private onRequestSuccess = (currentSession: number, values: { [id: string]: TValue }) => {
        if (currentSession !== this.currentSession) {
            console.warn(this.buildError(
                "requestData",
                "RequestData method was resolved after store data has been cleared. Check `this.cleanUpStore()` method calls."
            ));
            return;
        }
        if (values == null) {
            console.error(this.buildError("requestData", `Success values cannot be '${values}'.`));
            return;
        }
        this.updateQueuesFromRequest(values);
        this.dispatchChanges();
    }

    private onRequestFailed = (currentSession: number, ids: string[], values?: { [id: string]: ItemStatus } | string[]) => {
        if (currentSession !== this.currentSession) {
            console.warn(this.buildError(
                "requestData",
                "RequestData method was rejected after store data has been cleared. Check `this.cleanUpStore()` method calls."
            ));
            return;
        }

        if (values == null) {
            this.queuesHandler.SetMultipleItemsStatus(ids, ItemStatus.Failed);
        } else if (Array.isArray(values)) {
            this.queuesHandler.SetMultipleItemsStatus(values, ItemStatus.Failed);
        } else if (typeof values === "object") {
            let isExistResults = false;
            let results: { [status: number]: string } = {};

            Object.keys(values).forEach(id => {
                let status = values[id];
                results[status] = id;
                if (!isExistResults) {
                    isExistResults = true;
                }
            });
            if (isExistResults) {
                Object.keys(results).forEach(status => {
                    this.queuesHandler.SetMultipleItemsStatus(ids, parseInt(status));
                });
            } else {
                this.queuesHandler.SetMultipleItemsStatus(ids, ItemStatus.Failed);
            }
        } else {
            this.queuesHandler.SetMultipleItemsStatus(ids, ItemStatus.Failed);
        }

        this.dispatchChanges();
    }



    /**
     * Check if given function is Promise.
     *
     * @param {any} func - function
     */
    private isPromise<TResult>(func: any): func is Promise<TResult> {
        return func != null && func.then != null && func.catch != null;
    }


    /**
     * Get the value of a particular key. Returns Value undefined and status if the key does not exist in the cache.
     *
     * @param {string} key - Requested item key.
     * @param {boolean} [noCache=false] - Update cached item from the server.
     */
    public get(key: string, noCache: boolean = false): Item<TValue> {
        let item = this.getItem(key, noCache);
        this.createRequest();
        return item;
    }


    /**
     * Prefetch item by key.
     * @param {string} key - Requested item key.
     * @param {boolean} [noCache=false] = Update cached item from the server.
     */
    public Prefetch(key: string, noCache: boolean = false): void {
        this.get(key, noCache);
    }


    /**
     * Prefetch all items by keys.
     * @param {string[]} keys - Requested item key.
     * @param {boolean} [noCache=false] - Update cached item from the server.
     */
    public PrefetchAll(keys: string[], noCache?: boolean): void;
    public PrefetchAll(keys: Immutable.List<string>, noCache?: boolean): void;
    public PrefetchAll(keys: Immutable.Set<string>, noCache?: boolean): void;
    public PrefetchAll(keys: Immutable.OrderedSet<string>, noCache?: boolean): void;
    public PrefetchAll(keys: any, noCache: boolean = false): void {
        this.getAll(keys, undefined, noCache);
    }

    /**
     * Remove item from cache, if exist.
     *
     * @param {string} key - Requested item key.
     * @returns {void}
     */
    public InvalidateCache(key: string): void {
        this.invalidationHandler.Prepare([key]);
        this.dispatchChangesAsync();
    }

    /**
     * Remove multiple items from cache, if exist.
     *
     * @param {string[]} keys - Requested item key.
     * @returns {void}
     */
    public InvalidateCacheMultiple(keys: string[]): void {
        this.invalidationHandler.Prepare(keys);
        this.dispatchChangesAsync();
    }

    /**
     * Get the item value from state or add to queue.
     *
     * @param {string} key - Requested item key.
     * @param {boolean} noCache - Update cached item from the server.
     */
    private getItem(key: string, noCache: boolean): Item<TValue> {
        let item: Item<TValue>;
        if (key != null && this.getState().has(key) && !noCache) {
            item = this.getState().get(key);
        } else {
            if (this.queuesHandler.Has(key)) {
                item = this.queuesHandler.Get(key)!;
            } else {
                item = this.queuesHandler.Create(key);
            }
        }
        return item;
    }

    /**
     * Gets an array of keys and puts the values in a map if they exist, it allows
     * providing a previous result to update instead of generating a new map.
     *
     * Providing a previous result allows the possibility of keeping the same
     * reference if the keys did not change.
     *
     * @param {string[] | Immutable.List<string> } keys - Requested keys list in Array or Immutable List.
     * @param {Immutable.Map<string, T>} [prev] - Previous data list merged with new data list.
     * @param {boolean} [noCache=false] - Update cached items from the server.
     * @return {Items<TValue>} Requested data list.
     */
    public getAll(keys: string[], prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.List<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.Set<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: Immutable.OrderedSet<string>, prev?: Items<TValue>, noCache?: boolean): Items<TValue>;
    public getAll(keys: any, prev?: Items<TValue>, noCache: boolean = false): Items<TValue> {
        let newKeys: Immutable.Set<string>;
        let start = prev || this.getInitialState();

        if (keys != null) {
            if (keys instanceof Array) {
                try {
                    newKeys = Immutable.Set(keys);
                } catch (error) {
                    console.error(this.buildError("getAll", ERROR_GET_ALL_WRONG_PARAM));
                    newKeys = Immutable.Set<string>();
                }
            } else if (Immutable.Set.isSet(keys)) {
                newKeys = keys as Immutable.Set<string>;
            } else if (Immutable.OrderedSet.isOrderedSet(keys)) {
                newKeys = keys as Immutable.OrderedSet<string>;
            } else if (Immutable.List.isList(keys)) {
                try {
                    newKeys = keys.toSet() as Immutable.Set<string>;
                } catch (error) {
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

        return start.withMutations((resultMap) => {
            // remove any old keys that are not in new keys or are no longer in the cache
            if (resultMap.size > 0) {
                resultMap.forEach((oldValue, oldKey) => {
                    if (oldKey != null && (!newKeys.has(oldKey) || !this.getState().has(oldKey))) {
                        resultMap.delete(oldKey);
                    }
                });
            }
            // then add all of the new keys that exist in the cache
            newKeys.forEach((key) => {
                if (key != null) {
                    let item = this.getItem(key, noCache);
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
     * @return {Immutable.Map<string, T>} Initial empty state.
     */
    public getInitialState(): Items<TValue> {
        return Immutable.Map<string, Item<TValue>>({});
    }

    /**
     * Move completed items from queues to state.
     *
     * @private
     * @param {Items<TValue>} state
     * @returns {(Items<TValue> | undefined)}
     */
    private moveFromQueuesToState(state: Items<TValue>): Items<TValue> | undefined {
        let moveList = this.queuesHandler.GetFilteredItemsKeys(x => [ItemStatus.Loaded, ItemStatus.NoData, ItemStatus.Failed].indexOf(x.Status) !== -1);
        if (moveList.length > 0) {
            return state.withMutations(stateMap => {
                for (let i = 0; i < moveList.length; i++) {
                    let key = moveList[i];
                    let item = this.queuesHandler.Get(key);
                    if (item != null) {
                        stateMap.set(key, { ...item });
                    }
                    this.queuesHandler.Remove(key);
                }
            });
        }
        return undefined;
    }

    /**
     * Holds a function that will be invoked before store clean up.
     * 
     * @protected
     * @type {() => void}
     */
    protected storeWillCleanUp: () => void = () => {
        this.queuesHandler.RemoveAll();
    }

    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param {Items<TValue>} state - Store state.
     * @param {DispatcherMessage<any>} payload - Dispatched message from simplr-dispatcher.
     * @return {Items<TValue>} Updated state with new data.
     */
    public reduce(state: Items<TValue>, payload: DispatcherMessage<any>): Items<TValue> {
        if (payload.action instanceof DataMapStoreUpdatedAction) {
            if (this.getDispatchToken() === payload.action.StoreId) {
                let newState = this.moveFromQueuesToState(state);
                if (newState != null) {
                    state = newState;
                }
            }
        }
        state = super.reduce(state, payload);

        if (this.invalidationHandler.IsWaiting) {
            let result = this.invalidationHandler.Start(state);
            this.queuesHandler.RemoveMultiple(result.RemovedKeys);
            state = result.State;
        }

        return state;
    }

    /**
     * Access the value at the given key.
     * Return undefined if the key does not exist in the cache.
     *
     * @param {string} key
     * @returns {(Item<TValue> | undefined)}
     */
    public at(key: string): Item<TValue> | undefined {
        if (this.getState().has(key)) {
            return this.get(key);
        } else if (this.queuesHandler.Has(key)) {
            return this.queuesHandler.Get(key);
        } else {
            console.error(this.buildError("at", `Expected store to have key ${key}.`));
            return undefined;
        }
    }

    /**
     * Check if the cache has a particular key.
     *
     * @param {string} key
     * @returns {boolean}
     */
    public has(key: string): boolean {
        return this.getState().has(key) || this.queuesHandler.Has(key);
    }

}
