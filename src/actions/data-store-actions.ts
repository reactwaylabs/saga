export class StoreUpdatedAction {
    constructor(private _dispatchToken: string) { }
    public get dispatchToken(): string {
        return this._dispatchToken;
    }
}
