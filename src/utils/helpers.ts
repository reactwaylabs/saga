import * as Immutable from "immutable";

export function TransformArrayToImmutableSet(keys: Array<string>): Immutable.Set<string> {
    let list: Immutable.Set<string>;
    const transform = Immutable.Set(keys);
    list = transform;
    return list;
}

export function TransformImmutableListToImmutableSet(keys: Immutable.List<string>): Immutable.Set<string> {
    let list: Immutable.Set<string>;
    let transform = keys.toSet();
    list = transform;
    return list;
}
