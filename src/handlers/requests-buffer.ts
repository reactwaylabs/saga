import * as Immutable from "immutable";
import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import * as _ from "lodash";

/**
 * Buffers the items implicitly and debounces their requests
 */
export class RequestsBuffer<TValue> {
    constructor() {
        this.items = Immutable.Map<string, Item<TValue>>();
    }

    private $dataRequestDebounceTime: number = 50;

    public get dataRequestDebounceTime(): number {
        return this.$dataRequestDebounceTime;
    }

    public set dataRequestDebounceTime(value) {
        this.$dataRequestDebounceTime = value;
        this.throttledRequestData = _.throttle(this.fetchData, value, {
            leading: false
        });
    }

    protected items: Immutable.Map<string, Item<TValue>>;
    protected throttledRequestData: (() => void) & _.Cancelable;

    /**
     * Build error with prefix and class name.
     */
    private buildError(functionName: string, message: string): string {
        return `SimplrFlux.Buffer.${functionName}() [${this.constructor.name}]: ${message}`;
    }

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

    protected fetchData(): void {}
}
