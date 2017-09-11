export class DataMapStoreUpdatedAction {
    constructor(private storeId: string) { }
    public get StoreId() {
        return this.storeId;
    }
}

export class DataMapStoreCleanUpAction {
    constructor(private storeId: string) { }
    public get StoreId() {
        return this.storeId;
    }
}
