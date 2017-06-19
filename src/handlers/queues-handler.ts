import { Item } from "../abstractions/item";
import { ItemStatus } from "../abstractions/item-status";
import * as Immutable from "immutable";

const OBJECT_FREEZE_EXIST = Object != null && Object.freeze != null;

export class QueuesHandler<TValue> {
    constructor() {
        this.queues = Immutable.Map<string, Item<TValue>>();
    }

    /**
     * Queues list.
     *
     */
    private queues: Immutable.Map<string, Item<TValue>>;

    /**
     * Freeze specified object if global function exists.
     *
     * @param {TObject} obj - Object to freeze.
     */
    protected tryToFreezeObject<TObject>(obj: TObject): TObject {
        if (!OBJECT_FREEZE_EXIST) {
            return obj;
        }
        return Object.freeze(obj);
    }

    /**
     * Set item data by specified key.
     *
     * @param {string} key - Item key.
     * @param {(TValue | undefined)} value - Item value.
     * @param {ItemStatus} status - Item status.
     */
    public Set(key: string, value: TValue | undefined, status: ItemStatus): Item<TValue> {
        let newValue = new Item<TValue>(status, value);
        newValue = this.tryToFreezeObject(newValue);
        this.queues = this.queues.set(key, newValue);
        return newValue;
    }

    /**
     * Create new initial item with specified key.
     *
     * @param {string} key - Item key.
     */
    public Create(key: string): Item<TValue> {
        let newValue = new Item<TValue>(ItemStatus.Init);
        newValue = this.tryToFreezeObject(newValue);
        this.queues = this.queues.set(key, newValue);
        return newValue;
    }

    /**
     * Set specified status for item by key.
     *
     * @param {string} key - Item key.
     * @param {ItemStatus} status - Item status.
     */
    public SetItemStatus(key: string, status: ItemStatus): Item<TValue> {
        if (!this.queues.has(key)) {
            return this.Set(key, undefined, status);
        }

        this.queues = this.queues.update(key, oldValue => {
            let newValue = new Item<TValue>(status, oldValue.Value);
            return this.tryToFreezeObject(newValue);
        });

        return this.queues.get(key)!;
    }

    /**
     * Set specified status for multiple items by keys.
     *
     * @param {Array<string>} keys - List of items keys.
     * @param {ItemStatus} status - Item status.
     */
    public SetMultipleItemsStatus(keys: Array<string>, status: ItemStatus): void {
        this.queues = this.queues.withMutations(mutableQueues => {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (!mutableQueues.has(key)) {
                    continue;
                }
                mutableQueues = mutableQueues.update(key, oldValue => {
                    let newValue = new Item<TValue>(status, oldValue.Value);
                    return this.tryToFreezeObject(newValue);
                });
            }
        });
    }

    /**
     * Returns filtered items by specified item status.
     *
     * @param {ItemStatus} status - Item status.
     */
    public GetFilteredItems(filter: (item: Item<TValue>) => boolean): Immutable.Map<string, Item<TValue>> {
        return this.queues.filter(x => x != null && filter(x)).toMap();
    }

    /**
     * Returns filtered items keys by specified item status.
     *
     * @param {ItemStatus} status - Item status.
     * @returns {string[]}
     */
    public GetFilteredItemsKeys(filter: (item: Item<TValue>, key: string) => boolean): string[] {
        return this.queues
            .filter((value, key) => (key != null && value != null && filter(value, key)))
            .map((value, key) => key)
            .toArray() as string[];
    }

    /**
     * Returns the value with specified key from queues list.
     * Or `undefined` if item with specified key doesn't exist in queues list.
     *
     * @param {string} key - Item key.
     * @returns {Item<TValue> | undefined}
     */
    public Get(key: string): Item<TValue> | undefined {
        return this.queues.get(key);
    }

    /**
     * Return true if item with specified key exists in queues list.
     *
     * @param {string} key - Item key.
     * @returns {boolean}
     */
    public Has(key: string): boolean {
        return this.queues.has(key);
    }

    /**
     * Remove specified item by key from queues list.
     *
     * @param {string} key - Item key.
     */
    public Remove(key: string): void {
        this.queues = this.queues.remove(key);
    }

    /**
     * Remove multiple items by keys from queues list.
     *
     * @param {Array<string>} keys - Items keys list.
     */
    public RemoveMultiple(keys: Array<string>): void {
        this.queues = this.queues.withMutations(mutableQueues => {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (key == null) {
                    continue;
                }
                mutableQueues = mutableQueues.remove(key);
            }
        });
    }

    /**
     * Remove all items from queues list.
     *
     */
    public RemoveAll(): void {
        this.queues = Immutable.Map<string, Item<TValue>>();
    }
}
