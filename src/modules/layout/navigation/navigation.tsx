import React, { useState } from "react";
import classNames from "classnames";

function NavItem(props: { href: string; className?: string; children: React.ReactNode }): JSX.Element {
    return (
        <li className={classNames("nav-list-item", props.className)}>
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
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="navigation">
            <div className={classNames("wrapper", { "mobile-open": mobileOpen })}>
                <div className="logo-wrapper" onClick={() => setMobileOpen(!mobileOpen)}>
                    <span className="logo">
                        <a href="#" className="logo" onClick={event => event.stopPropagation()}>
                            Saga
                        </a>
                    </span>
                    <span className="mobile-menu">
                        <i className="fas fa-bars" />
                    </span>
                </div>
                <Nav className="main-nav">
                    <NavItem href="#">Get started</NavItem>
                    <NavItem href="#">API</NavItem>
                    <NavItem href="#">
                        <span className="fab fa-github" />
                        <span style={{marginTop: "2px"}}>Github</span>
                    </NavItem>
                </Nav>
            </div>
        </div>
    );
}
