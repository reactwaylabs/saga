export enum ItemStatus {
    Init = 0,
    Pending = 8,
    Loaded = 16,
    NoData = 64,
    Failed = 128
}

export interface Item<TValue> {
    value: TValue;
    status: ItemStatus;
}
