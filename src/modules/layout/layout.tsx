import React from "react";

import "./layout.scss";
import { Navigation } from "./navigation/navigation";

interface Props {
    children: React.ReactNode;
}

export function Layout(props: Props): JSX.Element {
    return (
        <div className="layout grid-y">
            <div className="navigation cell">
                <Navigation />
            </div>
            <div className="cell">full width cell</div>
        </div>
    );
}
