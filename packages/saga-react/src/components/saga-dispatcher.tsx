import React from "react";
import { Dispatcher } from "saga";

import { DispatcherContext } from "../contexts/dispatcher-context";

interface Props {
    dispatcher: Dispatcher;
    children: React.ReactNode
}

export function SagaDispatcher(props: Props): JSX.Element {
    return <DispatcherContext.Provider value={props.dispatcher}>{props.children}</DispatcherContext.Provider>;
}
