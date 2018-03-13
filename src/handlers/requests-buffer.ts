import * as Immutable from "immutable";
import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import * as _ from "lodash";
import { RequestDataHandler } from "../contracts";

/**
 * Buffers the items implicitly and debounces their requests
 */
export class RequestsBuffer<TValue> {
    constructor(protected readonly requestDataFunc: RequestDataHandler<TValue>) {
        this.items = Immutable.Map<string, Item<TValue>>();
        this.dataFetchThrottleTime = 50;
    }

    private $dataFetchThrottleTime: number = 50;

    public get dataFetchThrottleTime(): number {
        return this.$dataFetchThrottleTime;
    }

    public set dataFetchThrottleTime(value) {
        this.$dataFetchThrottleTime = value;
        this.throttledRequestData = _.throttle(this.requestData, value, {
            leading: false,
            trailing: true
        });
    }

    protected async requestData() {
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
    }

    protected items: Immutable.Map<string, Item<TValue>>;
    protected throttledRequestData: (() => void) & _.Cancelable;

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

    public enqueue(...keys: string[]) {
        if (keys.length === 1) {
            this.items = this.items.set(keys[0], this.createAndFreezeItem(ItemStatus.Init, undefined));
        } else {
            this.items = this.items.update(mutableItems => {
                for (const key of keys) {
                    mutableItems.set(key, this.createAndFreezeItem(ItemStatus.Init, undefined));
                }
                return mutableItems;
            });
        }

        this.throttledRequestData();
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
}
