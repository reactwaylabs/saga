import * as Immutable from "immutable";
import { Items } from "../contracts/items";

export class InvalidationHandler<TValue> {

    private pendingDeletionItems = Immutable.List<string>();

    /**
     * Handler has keys to invalidate and waiting for start.
     */
    public get IsWaiting(): boolean {
        return this.pendingDeletionItems.size > 0;
    }

    /**
     * Set keys for invalidation.
     *
     * @param {string[]} keys - List of keys.
     */
    public Prepare(keys: string[]): void {
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

    /**
     * Start invalidating pending keys and return new state with list of removed keys.
     *
     * @param {Items<TValue>} state - Store state.
     */
    public Start(state: Items<TValue>): { State: Items<TValue>, RemovedKeys: Array<string> } {
        let removed = new Array<string>(this.pendingDeletionItems.size);
        state = state.withMutations(mutableState => {
            let index = 0;
            this.pendingDeletionItems.forEach(key => {
                if (key == null) {
                    return;
                }
                if (mutableState.has(key)) {
                    mutableState = mutableState.delete(key);
                }
                removed[index++] = key;
            });
        });
        this.pendingDeletionItems = Immutable.List<string>();
        return {
            RemovedKeys: removed,
            State: state
        };
    }
}
