import { Store } from "flux/utils";

export async function WaitForStoreChanges(store: Store<any>): Promise<void> {
    return new Promise<void>(resolve => {
        const listener = store.addListener(() => {
            listener.remove();
            resolve();
        });
    });
}
