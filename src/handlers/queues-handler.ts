import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import * as Immutable from "immutable";

const OBJECT_FREEZE_EXIST = Object != null && Object.freeze != null;

export class QueuesHandler<TValue> {
    constructor() {
        this.queue = Immutable.Map<string, Item<TValue>>();
    }

    /**
     * queue.
     */
    private queue: Immutable.Map<string, Item<TValue>>;

    /**
     * Freeze specified object if global function exists.
     *
     * @param obj Object to freeze.
     */
    protected freezeObjectIfSupported<TObject>(obj: TObject): TObject {
        if (!OBJECT_FREEZE_EXIST) {
            return obj;
        }
        return Object.freeze(obj);
    }

    protected createAndFreezeItem(status: ItemStatus, value: TValue | undefined): Item<TValue> {
        const newValue = new Item<TValue>(ItemStatus.Init);
        return this.freezeObjectIfSupported(newValue);
    }

    /**
     * Sets an item data by key specified.
     *
     * @param key Item key.
     * @param value Item value.
     * @param status Item status.
     */
    public set(key: string, value: TValue | undefined, status: ItemStatus): void {
        const newValue = this.createAndFreezeItem(status, value);
        this.queue = this.queue.set(key, newValue);
    }

    /**
     * Creates an item with specified key and Init status.
     *
     * @param key Item key.
     */
    public create(key: string): void {
        const newValue = this.createAndFreezeItem(ItemStatus.Init, undefined);
        this.queue = this.queue.set(key, newValue);
    }

    /**
     * Sets a specified status for item by key.
     *
     * @param key Item key.
     * @param status Item status.
     */
    public setItemStatus(key: string, status: ItemStatus): void {
        if (!this.queue.has(key)) {
            this.set(key, undefined, status);
        }

        this.queue = this.queue.update(key, oldValue => this.createAndFreezeItem(status, oldValue.value));
    }

    /**
     * Sets a specified status for multiple items by given keys.
     *
     * @param keys List of items keys.
     * @param status Item status.
     */
    public setMultipleItemsStatus(keys: string[], status: ItemStatus): void {
        this.queue = this.queue.withMutations(mutableQueues => {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                if (!mutableQueues.has(key)) {
                    mutableQueues.set(key, this.createAndFreezeItem(status, undefined));
                } else {
                    mutableQueues.update(key, oldValue => this.createAndFreezeItem(status, oldValue.value));
                }
            }
        });
    }

    /**
     * Returns filtered items by specified item status.
     *
     * @param status Item status.
     */
    public getFilteredItems(filter: (item: Item<TValue>) => boolean): Immutable.Map<string, Item<TValue>> {
        return this.queue.filter(x => x != null && filter(x)).toMap();
    }

    /**
     * Returns filtered items keys by specified item status.
     *
     * @param status Item status.
     */
    public getFilteredItemsKeys(filter: (item: Item<TValue>, key: string) => boolean): string[] {
        return this.queue
            .filter((value, key) => key != null && value != null && filter(value, key))
            .keySeq()
            .toArray();
    }

    /**
     * Returns the value with specified key from queue
     * or `undefined` if an item with specified key doesn't exist in queue.
     *
     * @param key Item key.
     */
    public get(key: string): Item<TValue> | undefined {
        return this.queue.get(key);
    }

    /**
     * Checks whether an item with a specified key exists in queue.
     *
     * @param key Item key.
     */
    public has(key: string): boolean {
        return this.queue.has(key);
    }

    /**
     * Removes a specified item by key from queue.
     *
     * @param key Item key.
     */
    public remove(key: string): void {
        this.queue = this.queue.remove(key);
    }

    /**
     * Removes multiple items by given keys from queue.
     */
    public removeMultiple(keys: string[]): void {
        this.queue = this.queue.withMutations(mutableQueue => {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key == null) {
                    continue;
                }
                mutableQueue = mutableQueue.remove(key);
            }
        });
    }

    /**
     * Removes all items from queue.
     */
    public removeAll(): void {
        this.queue = Immutable.Map<string, Item<TValue>>();
    }
}
