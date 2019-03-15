import React, { createContext } from "react";
import { Dispatcher, AppDispatcher } from "saga";

export const DispatcherContext = createContext<Dispatcher>(AppDispatcher);

interface Props {
    dispatcher: Dispatcher;
    children: React.ReactNode;
}

export function SagaDispatcher(props: Props): React.ReactNode {
    return <DispatcherContext.Provider value={props.dispatcher}>{props.children}</DispatcherContext.Provider>;
}
