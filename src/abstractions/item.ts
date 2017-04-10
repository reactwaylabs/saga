import { ItemStatus } from "./item-status";

export class Item<T> {

    /**
     * Construct new item.
     *
     * @param status {ItemStatus} [status=ItemStatus.Init] - Intial item status.
     * @param value {T} [value=undefined] - Initial item value.
     */
    constructor(status?: ItemStatus, value?: T) {
        if (status != null) {
            this.Status = status;
        } else {
            this.Status = ItemStatus.Init;
        }

        if (value != null) {
            this.Value = value;
        }
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

