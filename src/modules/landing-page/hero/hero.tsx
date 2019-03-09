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
                </div>
            </div>
        </div>
    );
}
