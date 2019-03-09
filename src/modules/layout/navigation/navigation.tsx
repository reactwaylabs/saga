import React, { useState } from "react";
import classNames from "classnames";

import "./navigation.scss";

function NavItem(props: { href: string; className?: string; children: React.ReactNode }): JSX.Element {
    return (
        <li className={props.className}>
            <a href={props.href}>{props.children}</a>
        </li>
    );
}

function Nav(props: { className: string; children: React.ReactNode }): JSX.Element {
    return (
        <nav className={classNames("nav-list", props.className)}>
            <ul className="menu">{props.children}</ul>
        </nav>
    );
}

export function Navigation(): JSX.Element {
    const [mobileOpen, setMobileOpen] = useState(true);

    return (
        <div className="navigation">
            <div className={classNames("wrapper", { "mobile-open": mobileOpen })}>
                <div className="logo">
                    <span>saga</span>
                    <span className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
                        <i className="fas fa-bars" />
                    </span>
                </div>
                <Nav className="main-nav">
                    <NavItem href="#">One</NavItem>
                    <NavItem href="#">Two</NavItem>
                    <NavItem href="#">Three</NavItem>
                </Nav>
                <Nav className="more">
                    <NavItem href="#">v4.0.0-alpha</NavItem>
                    <NavItem href="#" className="github">
                        <i className="fab fa-github" />
                    </NavItem>
                </Nav>
            </div>
        </div>
    );
}
