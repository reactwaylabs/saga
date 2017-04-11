import * as Immutable from "immutable";
import { Items } from "../contracts/items";


export class InvalidationHandler<TValue> {

    private pendingDeletionItems = Immutable.List<string>();

    public get IsWaiting(): boolean {
        return this.pendingDeletionItems.size > 0;
    }

    public Prepare(keys: Array<string>): void {
        if (keys.length === 0) {
            return;
        }
        this.pendingDeletionItems.withMutations(mutablePendingDeletionItems => {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (this.pendingDeletionItems.indexOf(key) === -1) {
                    this.pendingDeletionItems = this.pendingDeletionItems.push(key);
                }
            }
        });
    }

    public Start(state: Items<TValue>): Items<TValue> {
        state = state.withMutations(mutableState => {
            this.pendingDeletionItems.forEach(key => {
                if (key != null && mutableState.has(key)) {
                    mutableState = mutableState.delete(key);
                }
            });
        });
        this.pendingDeletionItems = Immutable.List<string>();
        return state;
    }

}
