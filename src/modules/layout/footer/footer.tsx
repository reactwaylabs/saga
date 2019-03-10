import React from "react";

export function Footer(): JSX.Element {
    return (
        <div className="footer">
            <div className="wrapper">
                <div className="logo-wrapper">
                    <a href="#" className="logo">Saga</a>
                </div>
                <nav className="footer-nav">
                    <ul className="menu">
                        <li>
                            <a href="#">Get started</a>
                        </li>
                        <li>
                            <a href="#">API</a>
                        </li>
                        <li>
                            <a href="#">Github</a>
                        </li>
                    </ul>
                </nav>
                <div className="copyright">
                    Copyright <i className="far fa-copyright" /> 2019 QuatroDev
                </div>
            </div>
        </div>
    );
}
