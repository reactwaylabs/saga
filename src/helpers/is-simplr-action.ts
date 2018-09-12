import { DispatcherMessage, SimplrAction } from "../contracts/actions";

export function isSimplrAction(action: DispatcherMessage): action is SimplrAction {
    const $action = action as SimplrAction;
    return $action.type === "SIMPLR_ACTION";
}
