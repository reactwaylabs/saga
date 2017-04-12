import { ItemStatus } from "./item-status";

export class Item<T> {
    /**
     * Construct new item.
     *
     * @param status {ItemStatus} [status=ItemStatus.Init] - Intial item status.
     * @param value {T} [value=undefined] - Initial item value.
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

