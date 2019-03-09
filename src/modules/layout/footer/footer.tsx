import React from "react";

export function Footer(): JSX.Element {
    return (
        <div className="footer">
            <div className="wrapper">
                <nav className="footer-nav">
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
                            <a href="#">Github</a>
                        </li>
                    </ul>
                </nav>
                <div className="copyright">
                    <i className="far fa-copyright" /> QuatroDev
                </div>
            </div>
        </div>
    );
}
