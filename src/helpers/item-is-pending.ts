import { ItemStatus } from "../abstractions";

export function ItemIsPending(status: ItemStatus): boolean {
    return (status <= ItemStatus.Pending);
}
