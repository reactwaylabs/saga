import * as Flux from "flux";
import { Store } from "flux/utils";
import * as Immutable from "immutable";
import { ReduceStore } from "./reduce-store";
import { DispatcherMessage, Dispatcher } from "../dispatcher";
import { SynchronizeMapStoreAction } from "../actions/actions";
import { Item } from "../abstractions/item";
import { Items } from "../contracts/items";
import { ItemStatus } from "../abstractions/item-status";
import { InvalidationHandler } from "../handlers/invalidation-handler";
import { OnSuccess, OnFailure } from "../contracts/callbacks";
import { RequestsBuffer } from "../handlers/requests-buffer";

const ERROR_GET_ALL_WRONG_PARAM = "'keys' param accepts only 'string[]', 'Immutable.Set<string>' or 'Immutable.List<string>'.";

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
        this.requestsBuffer = new RequestsBuffer<TValue>();
        // this.requestsBuffer.
    }

    //#region Properties

    /**
     * With a large amount of requests MapStore debounces them.
     * This property defines interval between portions of requests.
     */
    protected requestsInterval: number = 50;
    protected requestIntervalTimer: undefined | number;

    protected requestsBuffer: RequestsBuffer<TValue>;

    //#endregion

    //#region Helpers

    /**
     * Build error with prefix and class name.
     */
    private buildError(functionName: string, message: string): string {
        return `SimplrFlux.MapStore.${functionName}() [${this.constructor.name}]: ${message}`;
    }

    protected dispatchSynchronizationAction(): void {
        Dispatcher.dispatch(new SynchronizeMapStoreAction(this.getDispatchToken()));
    }

    protected dispatchSynchronizationActionAsync(): void {
        setTimeout(() => {
            this.dispatchSynchronizationAction();
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
    protected abstract requestData(ids: string[], onSuccess: OnSuccess<TValue>, onFailed: OnFailure): Promise<void> | void;

    getState(): Items<TValue> {
        throw new Error(
            this.buildError(
                this.getState.name,
                "State behind the store is mutable, therefore store-specific methods must be used (get, isCached, etc.)."
            )
        );
    }

    protected state: Items<TValue> = this.getInitialState();

    /**
     * Gets the value of a particular key and
     * returns Value: undefined and status:init if the key does not exist in the cache.
     *
     * @param key Requested item key.
     * @param noCache Should cached item be re-fetched from the server.
     */
    public get(key: string, noCache: boolean = false): Item<TValue> {
        // If key is new to us
        if (!this.state.has(key)) {
            // Create synthetic value with ItemStatus.Init
            const newItem: Item<TValue> = new Item(ItemStatus.Init);
            Object.freeze(newItem);

            // And set it to state for subsequent requests to find it already
            this.state = this.state.set(key, newItem);

            // If the key does not exist in the buffer (it shouldn't)
            if (!this.requestsBuffer.has(key)) {
                // Add it to the buffer
                this.requestsBuffer.enqueue(key);
            }

            this.requestData([key], () => {}, () => {});
            return newItem;
        }


        // If key exists, we are sure the value is defined.
        return this.state.get(key)!;
    }

    public isCached(key: string): boolean {
        return this.state.has(key);
    }

    /**
     * Invalidates item if it exists in the cache.
     *
     * @param key Item key to be invalidated.
     */
    public invalidateCache(keys: string | string[]): void {
        throw new Error("Not implemented");
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
        throw new Error("Not implemented");
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
     * Reduces the current state, and an action to the new state of this store.
     * All subclasses must implement this method.
     * This method should be pure and have no side-effects.
     *
     * @param state Store state.
     * @param payload Dispatched message from simplr-dispatcher.
     */
    public reduce(state: Items<TValue>, payload: DispatcherMessage<any>): Items<TValue> {
        // if (payload.action instanceof SynchronizeMapStoreAction) {
        //     if (this.getDispatchToken() === payload.action.storeId) {
        //         const newState = this.moveFromQueuesToState(state);
        //         if (newState != null) {
        //             state = newState;
        //         }
        //     }
        // }
        // state = super.reduce(state, payload);

        // if (this.invalidationHandler.isWaiting) {
        //     const result = this.invalidationHandler.processEnqueuedInvalidations(state);
        //     this.queuesHandler.removeMultiple(result.removedKeys);
        //     state = result.state;
        // }

        // return state;
        throw new Error("Not implemented");
    }
}
