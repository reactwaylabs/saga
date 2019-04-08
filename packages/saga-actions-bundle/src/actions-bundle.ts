import { FSA, createAction, AppDispatcher } from "saga";

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

type ActionsMap = { [key: string]: [string, (uniqueId: string, ...args: any[]) => FSA] };

type Dispatch = (payload: any) => void;
type DispatchCreator<TActions> = (actions: TActions, uniqueId: string) => (payload: any) => void;

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

interface AsyncMeta {
    uniqueId: string;
}

interface PendingAction extends FSA<undefined> {
    type: "PENDING";
}

interface SuccessAction<TPayload> extends FSA<TPayload> {
    type: "SUCCESS";
}

interface FailedAction<TErrorPayload extends Error> extends FSA<TErrorPayload> {
    type: "FAILED";
}

export function createAsyncActionsCreator<TPayload, TErrorPayload extends Error>(request: () => Promise<unknown>) {
    return createActionsBundle(
        {
            pending: [
                "PENDING",
                (uniqueId: string) => createAction<PendingAction, AsyncMeta>("PENDING", undefined, { uniqueId: uniqueId })
            ],
            success: [
                "SUCCESS",
                (uniqueId: string, payload: TPayload) =>
                    createAction<SuccessAction<TPayload>, AsyncMeta>("SUCCESS", payload, { uniqueId: uniqueId })
            ],
            failed: [
                "FAILED",
                (uniqueId: string, payload: TErrorPayload) =>
                    createAction<FailedAction<TErrorPayload>, AsyncMeta>("FAILED", payload, { uniqueId: uniqueId })
            ]
        },
        (actions, uniqueId) => async dispatch => {
            const [, pending] = actions.pending;
            const [, success] = actions.success;
            const [, failed] = actions.failed;

            dispatch(pending(uniqueId));

            try {
                const result = (await request()) as TPayload;
                dispatch(success(uniqueId, result));
            } catch (error) {
                dispatch(failed(uniqueId, error));
            }
        }
    );
}


interface MapStoreLoadItemsAction extends FSA {
    type: "MAP_STORE_LOAD_ITEMS";
    payload: 
}

export function createMapActionsBundle<TItem>(request: () => Promise<unknown>) {
    return createActionsBundle({
        load: ["MAP_STORE_LOAD_ITEMS", (uniqueId: string, ids: string[]) =>]
    },

}
