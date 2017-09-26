import { ItemStatus } from "../abstractions";

export function SimplrFluxItemIsPending(status: ItemStatus): boolean {
    return (status <= ItemStatus.Pending);
}
