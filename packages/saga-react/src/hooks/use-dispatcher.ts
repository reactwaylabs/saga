import { useContext } from "react";
import { Dispatcher } from "saga";

import { DispatcherContext } from "../contexts/dispatcher-context";

export function useDispatcher(): Dispatcher {
    const dispatcher = useContext(DispatcherContext);
    return dispatcher;
}
