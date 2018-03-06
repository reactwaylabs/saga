import { ItemStatus } from "./item-status";

/**
 * Item class in map store state.
 */
export class Item<TValue> {
    /**
     * Constructs new item.
     */
    constructor(status: ItemStatus = ItemStatus.Init, value?: TValue) {
        this.status = status;
        this.value = value;
    }

    /**
     * Item status.
     */
    public readonly status: ItemStatus;

    /**
     * Item value.
     */
    public readonly value: Readonly<TValue> | undefined;
}
