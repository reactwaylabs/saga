import * as Immutable from "immutable";
import { Items } from "../contracts";

export class InvalidationBuffer<TValue> {
    private pendingKeys: Immutable.List<string> = Immutable.List();

    /**
     * Checks whether any keys are enqueued for invalidation.
     */
    public get isWaiting(): boolean {
        return this.pendingKeys.size > 0;
    }

    /**
     * Enqueues keys for invalidation.
     */
    public enqueue(keys: string[]): void {
        if (keys.length === 0) {
            return;
        }
        this.pendingKeys.withMutations(mutablePendingKeys => {
            for (const key of keys) {
                if (this.pendingKeys.indexOf(key) === -1) {
                    this.pendingKeys = this.pendingKeys.push(key);
                }
            }
        });
    }

    /**
     * Invalidates pending keys from a given state and returns a new state with a list of removed keys.
     *
     * @param state Store state to update.
     */
    public reduceEnqueuedInvalidations(state: Items<TValue>): { state: Items<TValue>; removedKeys: string[] } {
        const removedKeys = new Array<string>(this.pendingKeys.size);
        state = state.withMutations(mutableState => {
            let index = 0;
            this.pendingKeys.forEach(key => {
                if (mutableState.has(key)) {
                    mutableState = mutableState.remove(key);
                }
                removedKeys[index++] = key;
            });
        });
        this.pendingKeys = Immutable.List();
        return {
            removedKeys: removedKeys,
            state: state
        };
    }
}
