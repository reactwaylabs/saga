export class DataMapStoreUpdatedAction {
    constructor(private _storeId: string) { }
    public get storeId(): string {
        return this._storeId;
    }
}

export class DataMapStoreCleanUpAction {
    constructor(private _storeId: string) { }
    public get storeId(): string {
        return this._storeId;
    }
}
