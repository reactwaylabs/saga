export class SynchronizeMapStoreAction {
    constructor(private readonly _storeDispatchToken: string) { }
    public get storeDispatchToken(): string {
        return this._storeDispatchToken;
    }
}

export class MapStoreCleanUpAction {
    constructor(private _storeId: string) { }
    public get storeId(): string {
        return this._storeId;
    }
}
