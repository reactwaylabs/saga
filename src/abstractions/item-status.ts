/**
 * Item status in map store state.
 *
 * @export
 * @enum {number}
 */
export const enum ItemStatus {
    Init = 0,
    Pending = 8,
    Loaded = 16,
    NoData = 64,
    Failed = 128
}
