export class StoreUpdateAction {
    constructor(private dispatchToken: string) { }
    public get DispatchToken() {
        return this.dispatchToken;
    }
}
