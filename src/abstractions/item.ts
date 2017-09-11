import { ItemStatus } from "./item-status";

/**
 * Item class in map store state.
 *
 * @export
 * @class Item
 * @template T
 */
export class Item<T> {
    /**
     * Construct new item.
     *
     * @param {ItemStatus} [status=ItemStatus.Init] - Initial item status.
     * @param {T} [value=undefined] - Initial item value.
     */
    constructor(status?: ItemStatus, value?: T) {
        this.Status = (status != null) ? status : ItemStatus.Init;
        this.Value = (value != null) ? value : undefined;
    }

    /**
     * Item status.
     *
     */
    public readonly Status: ItemStatus;

    /**
     * Item value.
     *
     */
    public readonly Value: Readonly<T> | undefined;
}
