import React from "react";

import "./navigation.scss";

export function Navigation(): JSX.Element {
    return (
        <div className="navigation">
            <div className="wrapper">
                <div className="logo">saga</div>
                <nav>
                    <ul className="menu">
                        <li>
                            <a href="#">One</a>
                        </li>
                        <li>
                            <a href="#">Two</a>
                        </li>
                        <li>
                            <a href="#">Three</a>
                        </li>
                        <li>
                            <a href="#">Four</a>
                        </li>
                    </ul>
                </nav>
                <div className="more">
                    <a href="#">v4.0.0-alpha</a>
                    <a href="#" className="github">
                        <i className="fab fa-github" />
                    </a>
                </div>
            </div>
        </div>
    );
}
