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
     * @param obj {TObject} - Object to freeze.
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
     * @param key {string} - Item key.
     * @param value {(TValue | undefined)} - Item value.
     * @param status {ItemStatus} - Item status.
     */
    public Set(key: string, value: TValue | undefined, status: ItemStatus): void {
        let newValue = new Item<TValue>(status, value);
        newValue = this.tryToFreezeObject(newValue);
        this.queues = this.queues.set(key, newValue);
    }

    /**
     * Create new initial item with specified key.
     *
     * @param key {string} - Item key.
     */
    public Create(key: string): Item<TValue> {
        let newValue = new Item<TValue>(ItemStatus.Init);
        newValue = this.tryToFreezeObject(newValue);
        this.queues = this.queues.set(key, newValue);
        return newValue;
    }

    /**
     * Set spcified status for item by key.
     *
     * @param key {string} - Item key.
     * @param status {ItemStatus} - Item status.
     */
    public SetItemStatus(key: string, status: ItemStatus): void {
        if (!this.queues.has(key)) {
            return;
        }
        this.queues = this.queues.update(key, oldValue => {
            let newValue = new Item<TValue>(status, oldValue.Value);
            return this.tryToFreezeObject(newValue);
        });
    }

    /**
     * Set specified status for multiple items by keys.
     *
     * @param keys {Array<string>} - List of items keys.
     * @param status {ItemStatus} - Item status.
     */
    public SetItemsStatus(keys: Array<string>, status: ItemStatus): void {
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
     * @param status {ItemStatus} - Item status.
     */
    public GetItemsByStatus(status: ItemStatus): Immutable.Map<string, Item<TValue>> {
        return this.queues.filter(x => x != null && x.Status === status).toMap();
    }

    /**
     * Returns the value with specified key from queues list.
     * Or `undefined` if item with specified key doesn't exist in queues list.
     *
     * @param key {string} - Item key.
     */
    public Get(key: string): Item<TValue> | undefined {
        return this.queues.get(key);
    }

    /**
     * Return true if item with specified key exists in queues list.
     *
     * @param key {string} - Item key.
     */
    public Has(key: string): boolean {
        return this.queues.has(key);
    }

    /**
     * Remove specified item by key from queues list.
     *
     * @param key {string} - Item key.
     */
    public Remove(key: string): void {
        this.queues = this.queues.remove(key);
    }

    /**
     * Remove multiple items by keys from queues list.
     *
     * @param keys {Array<string>} - Items keys list.
     */
    public RemoveMulti(keys: Array<string>): void {
        this.queues.withMutations(mutableQueues => {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
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
