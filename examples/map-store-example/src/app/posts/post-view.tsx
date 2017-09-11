import * as React from "react";

import "./post-view.css";

interface Props {
    id: number;
    title: string;
    body: string;
}

export class PostView extends React.Component<Props, {}> {
    render() {
        return <div className="post-view">
            <div>
                <span className="field-title">
                    Id:
                </span>
                {this.props.id}
            </div>
            <div>
                <span className="field-title">
                    Title:
                </span>
                <span>{this.props.title}</span>
            </div>
            <div>
                <span className="field-title">
                    Body:
                </span>
                <span>{this.props.body}</span>
            </div>
        </div>;
    }
}
