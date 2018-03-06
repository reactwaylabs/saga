import * as Immutable from "immutable";
import { Items } from "../contracts/items";

export class InvalidationHandler<TValue> {

    private pendingDeletionItems: Immutable.List<string> = Immutable.List();

    /**
     * Checks whether any keys are enqueued for invalidation.
     */
    public get isWaiting(): boolean {
        return this.pendingDeletionItems.size > 0;
    }

    /**
     * Enqueues keys for invalidation.
     */
    public enqueue(keys: string[]): void {
        if (keys.length === 0) {
            return;
        }
        this.pendingDeletionItems.withMutations(mutablePendingDeletionItems => {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (this.pendingDeletionItems.indexOf(key) === -1) {
                    this.pendingDeletionItems = this.pendingDeletionItems.push(key);
                }
            }
        });
    }

    /**
     * Invalidates pending keys from given state and returns a new state with a list of removed keys.
     *
     * @param state Store state.
     */
    public processEnqueuedInvalidations(state: Items<TValue>): { state: Items<TValue>, removedKeys: string[] } {
        const removed = new Array<string>(this.pendingDeletionItems.size);
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
            removedKeys: removed,
            state: state
        };
    }
}
