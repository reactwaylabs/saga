import React from "react";
import classNames from "classnames";

interface Props {
    className?: string;
    headings: Array<{ value: string; depth: number }>;
}

export function Toc(props: Props): JSX.Element {
    return (
        <div className={classNames("toc", props.className)}>
            <nav className="vertical menu">
                <ul>
                    {props.headings.map(heading => {
                        return (
                            <li key={heading.value + heading.depth}>
                                <a href={`#`}>{heading.value}</a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
