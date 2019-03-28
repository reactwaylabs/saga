import { FSA } from "saga";

import { generateRandomString } from "./helpers";

export interface ActionsBundle<TActions> {
    /**
     * @internal
     */
    $type: string;
    actions: TActions;
    dispatch: (dispatch: Dispatch) => void;
}

const $ActionsBundleType = `ActionsBundle_${generateRandomString()}`;

export function isActionsBundle<TActions = any>(obj: any): obj is ActionsBundle<TActions> {
    return obj.$type === $ActionsBundleType;
}

type ActionsMap = { [key: string]: [string, (uniqueId: string) => FSA] };

type Dispatch = (payload: unknown) => void;
type DispatchCreator<TActions> = (actions: TActions, uniqueId: string) => Dispatch;

class ActionsBundleClass<TActions> implements ActionsBundle<TActions> {
    constructor(public readonly actions: TActions, private _dispatch: DispatchCreator<TActions>) {
        this.uniqueId = `ID_${ActionsBundleClass.bundleCounter++}`;
    }

    public static bundleCounter: number = 0;
    private uniqueId: string;

    public $type: string = $ActionsBundleType;

    public dispatch(dispatch: Dispatch): void {
        this._dispatch(this.actions, this.uniqueId)(dispatch);
    }
}

export function createActionsBundle<TActions extends ActionsMap>(
    actions: TActions,
    dispatch: DispatchCreator<TActions>
): ActionsBundle<TActions> {
    return new ActionsBundleClass(actions, dispatch);
}


const asyncActionsBundle = createActionsBundle({
    pending: ["PENDING", (action)]
}
