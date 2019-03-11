import React from "react";
import { Link } from "gatsby";

import { useMenu } from "../hooks/use-menu";

interface Props {
    className?: string;
}

export function Sidebar(props: Props): JSX.Element {
    const menuItems = useMenu();
    return (
        <aside className={props.className}>
            <nav>
                <ul className="vertical menu">
                    {menuItems.map(item => {
                        return (
                            <li key={item.path}>
                                <Link to={item.path} activeClassName="active">
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
