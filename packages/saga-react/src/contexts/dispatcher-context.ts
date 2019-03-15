import React from "react";
import { Dispatcher, AppDispatcher } from "saga";

export const DispatcherContext = React.createContext<Dispatcher>(AppDispatcher);
