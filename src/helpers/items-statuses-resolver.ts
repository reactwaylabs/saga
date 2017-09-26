import { ItemStatus } from "../abstractions/item-status";

export function ItemsStatusesResolver(...statuses: ItemStatus[]): ItemStatus {
    let loadedCount: number = 0;
    let noDataCount: number = 0;
    let pendingCount: number = 0;

    for (let i = 0; i < statuses.length; i++) {
        const status = statuses[i];
        switch (status) {
            case ItemStatus.Failed:
                return status;
            case ItemStatus.Loaded:
                loadedCount++;
                break;
            case ItemStatus.NoData:
                noDataCount++;
                break;
            case ItemStatus.Init:
            case ItemStatus.Pending:
                pendingCount++;
                break;
        }
    }

    if (pendingCount > 0) {
        return ItemStatus.Pending;
    } else if (loadedCount === 0 && noDataCount > 0) {
        return ItemStatus.NoData;
    } else {
        return ItemStatus.Loaded;
    }
}
