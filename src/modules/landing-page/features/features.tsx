import React from "react";
import { DiReact } from "react-icons/di";

import TypeScript from "./assets/ts.svg";
import Flux from "./assets/flux.svg";

import "./features.scss";

function FeaturedItem(props: { title: string; icon: JSX.Element; children: string }): JSX.Element {
    return (
        <div className="featured-item cell small-full medium-auto">
            <div className="icon">{props.icon}</div>
            <h2>{props.title}</h2>
            <p>{props.children}</p>
        </div>
    );
}

export function Features(): JSX.Element {
    return (
        <div className="features">
            <div className="wrapper grid-x grid-margin-x">
                <FeaturedItem icon={<DiReact color="#61dafb" />} title="React support">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed bibendum elit blandit lacus porttitor, eget elementum
                    turpis auctor.
                </FeaturedItem>
                <FeaturedItem icon={<TypeScript />} title="Written in TypeScript">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed bibendum elit blandit lacus porttitor, eget elementum
                    turpis auctor.
                </FeaturedItem>
                <FeaturedItem icon={<Flux />} title="Based on Flux">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed bibendum elit blandit lacus porttitor, eget elementum
                    turpis auctor.
                </FeaturedItem>
            </div>
        </div>
    );
}
