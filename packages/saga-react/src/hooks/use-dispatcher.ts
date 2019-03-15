import { useContext } from "react";
import { Dispatcher } from "saga";

import { DispatcherContext } from "../components/saga-dispatcher";

export function useDispatcher(): Dispatcher {
    const dispatcher = useContext(DispatcherContext);
    return dispatcher;
}
