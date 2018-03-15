import * as Flux from "flux";
// import { Store } from "flux/utils";
import * as Immutable from "immutable";
import { ReduceStore } from "./reduce-store";
import { DispatcherMessage, Dispatcher } from "../dispatcher";
import { SynchronizeMapStoreAction } from "../actions/actions";
import { Item } from "../abstractions/item";
import { Items, RequestDataHandlerResult } from "../contracts";
import { ItemStatus } from "../abstractions/item-status";
// import { InvalidationHandler } from "../handlers/invalidation-handler";
import { RequestsBuffer } from "../handlers/requests-buffer";

// const ERROR_GET_ALL_WRONG_PARAM = "'keys' param accepts only 'string[]', 'Immutable.Set<string>' or 'Immutable.List<string>'.";

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
        this.requestsBuffer = new RequestsBuffer<TValue>(dispatcher || Dispatcher, this.getDispatchToken(), this.requestData.bind(this));

        this.registerAction<SynchronizeMapStoreAction>(SynchronizeMapStoreAction, this.synchronizeStoreStateWithBuffer.bind(this));
    }

    //#region Properties

    protected requestsBuffer: RequestsBuffer<TValue>;

    /**
     * With a large amount of requests MapStore debounces them.
     * This property defines interval between portions of requests.
     */
    protected get dataFetchThrottleTime(): number {
        return this.requestsBuffer.dataFetchThrottleTime;
    }
    protected set dataFetchThrottleTime(value: number) {
        this.requestsBuffer.dataFetchThrottleTime = value;
    }

    //#endregion

    //#region Helpers

    /**
     * Build error with prefix and class name.
     */
    private buildError(functionName: string, message: string): string {
        return `SimplrFlux.MapStore.${functionName}() [${this.constructor.name}]: ${message}`;
    }

    protected dispatchSynchronizationAction(): void {
        Dispatcher.dispatch({
            action: new SynchronizeMapStoreAction(this.getDispatchToken())
        });
    }
    //#endregion

    /**
     * An abstract method to provide data for requested ids.
     *
     * @param ids List of requested ids.
     * @param onSuccess Callback to resolve some values.
     * @param onFailed Callback to reject some values.
     */
    protected abstract requestData(ids: string[]): Promise<RequestDataHandlerResult<TValue>>;

    /**
     * @throws Always throws, because state behind MapStore is mutable,
     * therefore store-specific methods must be used (get, isCached, etc.).
     */
    public getState(): Items<TValue> {
        throw new Error(
            this.buildError(
                this.getState.name,
                "State behind MapStore is mutable, therefore store-specific methods must be used (get, isCached, etc.)."
            )
        );
    }

    protected _state: Items<TValue> = this.getInitialState();

    /**
     * Gets the value of a particular key and
     * returns Value: undefined and status:init if the key does not exist in the cache.
     *
     * @param key Requested item key.
     * @param noCache Should cached item be re-fetched from the server.
     */
    public get(key: string, noCache: boolean = false): Item<TValue> {
        if (noCache) {
            this.invalidateCache(key);
        }

        // If key is new to us
        if (!this._state.has(key)) {
            // Create synthetic value with ItemStatus.Init
            const newItem: Item<TValue> = new Item(ItemStatus.Init);
            Object.freeze(newItem);

            // And set it to state for subsequent requests to find it already
            this._state = this._state.set(key, newItem);

            // If the key does not exist in the buffer (it shouldn't)
            if (!this.requestsBuffer.has(key)) {
                // Add it to the buffer
                this.requestsBuffer.enqueue(key);
            }

            return newItem;
        }

        // If key exists, we are sure the value is defined.
        return this._state.get(key)!;
    }

    public isCached(key: string): boolean {
        return this._state.has(key);
    }

    /**
     * Invalidates item if it exists in the cache.
     *
     * @param key Item key to be invalidated.
     */
    public invalidateCache(keys: string | string[]): void {
        let keysArray: string[];
        if (Array.isArray(keys)) {
            keysArray = keys;
        } else {
            keysArray = [keys];
        }

        if (keysArray.length === 0) {
            return;
        }

        // Invalidate cache
        this._state = this._state.withMutations(mutableState => {
            for (const key of keysArray) {
                mutableState.remove(key);
            }
        });
        this.requestsBuffer.removeAll(keysArray);
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
        let keysArray: string[];

        if (Array.isArray(keys)) {
            keysArray = keys;
        } else {
            throw new Error("Not implemented");
        }

        if (noCache) {
            this.invalidateCache(keysArray);
        }

        const keysToEnqueue: string[] = [];
        const foundItems: { [key: string]: Item<TValue> } = {};

        this._state = this._state.withMutations(mutableState => {
            for (const key of keysArray) {
                // If the key is new to us
                if (!mutableState.has(key)) {
                    // Create synthetic value with ItemStatus.Init
                    const newItem: Item<TValue> = new Item(ItemStatus.Init);
                    Object.freeze(newItem);
                    mutableState.set(key, newItem);

                    // If the key does not exist in the buffer (it shouldn't)
                    if (!this.requestsBuffer.has(key)) {
                        keysToEnqueue.push(key);
                    }
                }

                foundItems[key] = mutableState.get(key)!;
            }
        });

        this.requestsBuffer.enqueue(...keysToEnqueue);

        return Immutable.Map(foundItems);
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

    public synchronizeStoreStateWithBuffer(action: SynchronizeMapStoreAction, state: Items<TValue>): Items<TValue> {
        if (this.getDispatchToken() !== action.storeDispatchToken) {
            return state;
        }

        const fulfilledItems = this.requestsBuffer.filterByStatuses([ItemStatus.Loaded, ItemStatus.NoData, ItemStatus.Failed]);
        const pendingItems = this.requestsBuffer.filterByStatuses([ItemStatus.Pending]);

        if (fulfilledItems.count() === 0) {
            return state;
        }
        // Merges fulfilled and pending items on top of previous state
        const newState = state.merge(fulfilledItems.merge(pendingItems));
        // Remove fulfilled items from the buffer
        this.requestsBuffer.removeAll(fulfilledItems.keySeq().toArray());

        return newState;
    }

    /**
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state Store state.
     * @param payload Dispatched message from simplr-dispatcher.
     */
    // public reduce(state: Items<TValue>, payload: DispatcherMessage<any>): Items<TValue> {
    //     if (payload.action instanceof SynchronizeMapStoreAction) {

    //     }
    //     state = super.reduce(state, payload);

    //     // if (this.invalidationHandler.isWaiting) {
    //     //     const result = this.invalidationHandler.processEnqueuedInvalidations(state);
    //     //     this.queuesHandler.removeMultiple(result.removedKeys);
    //     //     state = result.state;
    //     // }

    //     return state;
    //     // throw new Error("Not implemented");
    // }
}
