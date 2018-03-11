export class UpdateDataStoreAction {
    constructor(private _dispatchToken: string) { }
    public get dispatchToken(): string {
        return this._dispatchToken;
    }
}
