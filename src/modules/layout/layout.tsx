import React from "react";

import { Navigation } from "./navigation/navigation";
import { Footer } from "./footer/footer";

interface Props {
    children: React.ReactNode;
}

export function Layout(props: Props): JSX.Element {
    return (
        <div className="layout grid-y">
            <header className="cell">
                <Navigation />
            </header>
            <main className="cell auto">{props.children}</main>
            <footer className="cell">
                <Footer />
            </footer>
        </div>
    );
}
