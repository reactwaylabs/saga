export class SynchronizeMapStoreAction {
    constructor(private _storeId: string) { }
    public get storeId(): string {
        return this._storeId;
    }
}

export class MapStoreCleanUpAction {
    constructor(private _storeId: string) { }
    public get storeId(): string {
        return this._storeId;
    }
}
