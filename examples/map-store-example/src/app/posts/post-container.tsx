import * as React from "react";
import { Abstractions } from "simplr-flux";
import { Container } from "flux/utils";

import { PostsStore, Post } from "./posts-store";

import { PostView } from "./post-view";

interface State {
    Post: Abstractions.Item<Post>;
}

interface Props {
    id: string;
}

class PostsContainerClass extends React.Component<Props, State> {
    static getStores() {
        return [PostsStore];
    }

    static calculateState(state: State, props: Props): State {
        return {
            Post: PostsStore.get(props.id)
        };
    }

    render() {
        switch (this.state.Post.Status) {
            case Abstractions.ItemStatus.Init: return <div>Post loading initialized.</div>;
            case Abstractions.ItemStatus.Pending: return <div>Post loading pending.</div>;
            case Abstractions.ItemStatus.Loaded: {
                return <PostView
                    id={this.state.Post.Value!.id}
                    title={this.state.Post.Value!.title}
                    body={this.state.Post.Value!.body}
                />;
            }
            case Abstractions.ItemStatus.NoData: return <div>No post found.</div>;
            case Abstractions.ItemStatus.Failed: return <div>Failed to load post.</div>;
        }
    }
}

export const PostsContainer = Container.create(PostsContainerClass, { withProps: true });
