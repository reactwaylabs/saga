import React from "react";

import "./hero.scss";

export function Hero(): JSX.Element {
    return (
        <div className="hero">
            <div className="wrapper">
                <div className="content">
                    <div className="logo">
                        <h1 className="title">Saga</h1>
                    </div>
                    <p className="subtitle">Yet Another State Management for JavaScript Apps.</p>
                    <div className="buttons">
                        <button className="button primary hollow large">Get started</button>
                        <button className="button grey hollow large">Examples</button>
                    </div>
                    <p>
                        Version: <a href="#">v4.0.0-alpha</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
