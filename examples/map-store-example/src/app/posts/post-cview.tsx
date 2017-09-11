import * as React from "react";
import { PostsContainer } from "./post-container";
import "./post-cview.css";

interface State {
    Id: number;
}

export class PostCView extends React.Component<{}, State> {

    state: State = {
        Id: 1
    };

    private onNextPostClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        this.setState(state => {
            state.Id++;
            return state;
        });
    }

    private onPreviousPostClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        this.setState(state => {
            const newId = this.state.Id - 1;
            if (newId > 0) {
                state.Id = newId;
            }
            return state;
        });
    }

    render() {
        return <div className="post-cview">
            <div className="control-container">
                <button onClick={this.onPreviousPostClick}>Previous</button>
            </div>
            <PostsContainer id={this.state.Id.toString()} />
            <div className="control-container">
                <button onClick={this.onNextPostClick}>Next</button>
            </div>
        </div>;
    }
}
