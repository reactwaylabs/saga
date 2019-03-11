import React from "react";
import classNames from "classnames";

interface Props {
    className?: string;
}

export function Toc(props: Props): JSX.Element {
    return <div className={classNames("toc", props.className)}>TOC</div>;
}
