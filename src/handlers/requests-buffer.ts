import * as Flux from "flux";
import * as Immutable from "immutable";
import * as _ from "lodash";
import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import { RequestDataHandler } from "../contracts";
import { DispatcherMessage } from "..";
import { SynchronizeMapStoreAction } from "../actions/actions";

/**
 * Buffers the items implicitly and debounces their requests
 */

export class RequestsBuffer<TValue> {
    constructor(
        protected readonly dispatcher: Flux.Dispatcher<DispatcherMessage<any>>,
        protected readonly mapStoreDispatchToken: string,
        protected readonly requestDataFunc: RequestDataHandler<TValue>
    ) {
        this.items = Immutable.Map<string, Item<TValue>>();
        this.dataFetchThrottleTime = 50;
    }

    protected items: Immutable.Map<string, Item<TValue>>;
    protected throttledRequestData: (() => void) & _.Cancelable;

    private _dataFetchThrottleTime: number = 50;

    public get dataFetchThrottleTime(): number {
        return this._dataFetchThrottleTime;
    }

    public set dataFetchThrottleTime(value) {
        this._dataFetchThrottleTime = value;
        this.throttledRequestData = _.throttle(this.requestDataFuncCaller, value, {
            leading: false,
            trailing: true
        });
    }

    public enqueue(...keys: string[]): void {
        if (keys.length === 1) {
            this.items = this.items.set(keys[0], this.createAndFreezeItem(ItemStatus.Init, undefined));
        } else {
            this.items = this.items.withMutations(mutableItems => {
                for (const key of keys) {
                    mutableItems.set(key, this.createAndFreezeItem(ItemStatus.Init, undefined));
                }
                return mutableItems;
            });
        }

        this.throttledRequestData();
    }

    protected async requestDataFuncCaller(): Promise<void> {
        const keysToFetch: string[] = this.items
            .filter(x => x.status === ItemStatus.Init)
            .keySeq()
            .toArray();

        this.items = this.items.withMutations(mutableItems => {
            for (const key of keysToFetch) {
                // As keys were filtered from existing items, they will definitely exist.
                // We simply override them with a pending status.
                mutableItems.set(key, this.createAndFreezeItem(ItemStatus.Pending, undefined));
            }
        });

        try {
            const result = await this.requestDataFunc(keysToFetch);
            this.items = this.items.withMutations(mutableItems => {
                for (const key of Object.keys(result)) {
                    // As keys were filtered from existing items, they will definitely exist.
                    // We simply override them with a pending status.
                    const value = result[key];
                    if (value != null) {
                        mutableItems.set(key, this.createAndFreezeItem(ItemStatus.Loaded, value));
                    } else {
                        mutableItems.set(key, this.createAndFreezeItem(ItemStatus.NoData, undefined));
                    }
                }
            });
        } catch {
            this.items = this.items.withMutations(mutableItems => {
                for (const key of keysToFetch) {
                    // As keys were filtered from existing items, they will definitely exist.
                    // We simply override them with a pending status.
                    mutableItems.set(key, this.createAndFreezeItem(ItemStatus.Failed, undefined));
                }
            });
        }

        this.dispatcher.dispatch({
            action: new SynchronizeMapStoreAction(this.mapStoreDispatchToken)
        });
    }

    public set(key: string, status: ItemStatus, value?: TValue): void {
        this.items = this.items.set(key, this.createAndFreezeItem(status, value));
    }

    /**
     * Sets a specified status for item by key.
     *
     * @param key Item key.
     * @param status Item status.
     */
    public setItemStatus(key: string, status: ItemStatus): void {
        this.set(key, status);
    }

    /**
     * Sets a specified status for multiple items by given keys.
     *
     * @param keys List of items keys.
     * @param status Item status to be set for all items.
     */
    public setItemsStatus(keys: string[], status: ItemStatus): void {
        if (keys.length === 1) {
            this.setItemStatus(keys[0], status);
            return;
        }

        this.items = this.items.withMutations(mutableItems => {
            for (const key of keys) {
                if (!mutableItems.has(key)) {
                    mutableItems.set(key, this.createAndFreezeItem(status, undefined));
                } else {
                    mutableItems.update(key, oldValue => this.createAndFreezeItem(status, oldValue.value));
                }
            }
        });
    }

    /**
     * Returns value by specified key from the buffer
     * or `undefined` if an item with specified key doesn't exist.
     *
     * @param key Item key.
     */
    public get(key: string): Item<TValue> | undefined {
        return this.items.get(key);
    }

    /**
     * Checks whether an item with a specified key exists in the buffer.
     *
     * @param key Item key.
     */
    public has(key: string): boolean {
        return this.items.has(key);
    }

    public filterByStatuses(statuses: ItemStatus[]): Immutable.Map<string, Item<TValue>> {
        return this.items.filter(x => statuses.indexOf(x.status) !== -1);
    }

    public remove(key: string): void {
        this.items = this.items.remove(key);
    }

    public removeAll(keys: string[]): void {
        this.items = this.items.removeAll(keys);
    }

    // /**
    //  * Build error with prefix and class name.
    //  */
    // private buildError(functionName: string, message: string): string {
    //     return `SimplrFlux.Buffer.${functionName}() [${this.constructor.name}]: ${message}`;
    // }

    protected createAndFreezeItem(status: ItemStatus, value: TValue | undefined): Item<TValue> {
        const newValue = new Item<TValue>(status, value);
        return Object.freeze(newValue);
    }
}
