# simplr-flux

Flux implementation that enables you to handle actions by their type, without nasty and never ending if or switch trees.
The package is most useful when used with [TypeScript](https://www.typescriptlang.org/) and [React](https://www.typescriptlang.org/).

## Get started

```sh
npm install simplr-flux --save
```

## Concepts

Basic concepts of simplr-flux are no different from [original flux](https://facebook.github.io/flux/) [concepts](https://github.com/facebook/flux/tree/master/examples/flux-concepts).

We also recommend you to follow [best practices](https://facebook.github.io/flux/docs/flux-utils.html#best-practices) original flux is proposing.

## Actions

> Actions define the internal API of your application. They capture the ways in which anything might interact with your application.

In SimplrFlux action is basically a class with all necessary data provided.

```ts
// action with no data provided
export class ResetCountAction { }

// action with additional data provided
export class CountChangedAction {
    constructor(private count: number) {}

    public get Count() {
        return this.count;
    }
}
```

## Dispatcher

> The dispatcher receives actions and dispatches them to stores that have registered with the dispatcher.

Every store will receive actions that were registered in specific store.

Dispatching is usually performed in ActionCreators.

```ts
import { Dispatcher } from "simplr-flux";
import {
    CountChangedAction
} from "./counter-actions";

export function CountChanged(count: number) {
    Dispatcher.dispatch(new CountChangedAction(count));
}
```

## Action creators

An action creator is a set of functions to dispatch actions.
You may choose the way to aggregate these functions,
but we recommend you to use exported functions within single namespace when using TypeScript.

```ts
import { Dispatcher } from "simplr-flux";
import {
    CountUpAction,
    CountDownAction,
    ResetCountAction,
    CountChangedAction
} from "./counter-actions";

export namespace CounterActionsCreators {
    export function CountUp() {
        Dispatcher.dispatch(new CountUpAction);
    }

    export function CountDown() {
        Dispatcher.dispatch(new CountDownAction);
    }

    export function ResetCount() {
        Dispatcher.dispatch(new ResetCountAction);
    }

    export function CountChanged(count: number) {
        Dispatcher.dispatch(new CountChangedAction(count));
    }
}
```

## Stores

> A store is what holds the data of an application. Stores will register with the application's dispatcher so that they can receive actions.

Main difference between store types in SimplrFlux is state management.

In accordance with your data structure you may choose type of store that best fits your data structure.

### ReduceStore

ReduceStore `state` can be any `object` and have no structure constraints.

Only way to change `state` of `ReduceStore` is actions `handlers`.
Actions are registered in store's `constructor` using protected method `registerAction` which takes `action` class and `handler` function as arguments (check `API` section).
Changed store state should be returned as a result of `handler` function.

Accessing data can be accomplished using public method `getState(): StoreState` or you may implement additional public getters by yourself (e. g. public getter `Count()`).

```ts
import { ReduceStore } from "simplr-flux";
import {
    CountDownAction,
    CountUpAction,
    ResetCountAction,
    CountChangedAction
} from "./counter-actions";

interface StoreState {
    Count: number;
}

class CounterReduceStoreClass extends ReduceStore<StoreState> {
    constructor() {
        super();
        this.registerAction(CountDownAction, this.onCountDown.bind(this));
        this.registerAction(CountUpAction, this.onCountUp.bind(this));
        this.registerAction(ResetCountAction, this.onResetCount.bind(this));
        this.registerAction(CountChangedAction, this.onCountChanged.bind(this));
    }

    private onCountDown(action: CountDownAction, state: StoreState): StoreState {
        return {
            Count: state.Count - 1
        };
    }

    private onCountUp(action: CountUpAction, state: StoreState): StoreState {
        return {
            Count: state.Count + 1
        };
    }

    private onResetCount(action: ResetCountAction, state: StoreState): StoreState {
        return this.getInitialState();
    }

    private onCountChanged(action: CountChangedAction, state: StoreState): StoreState {
        return {
            Count: action.Count
        };
    }

    getInitialState(): StoreState {
        return {
            Count: 0
        };
    }

    public get Count(): number {
        return this.getState().Count;
    }
}

export const CounterReduceStore = new CounterReduceStoreClass();
```

### MapStore

`MapStore` is a key-value store with a state of [Immutable.Map](https://facebook.github.io/immutable-js/docs/#/Map).

To get values from `MapStore` you should use public methods `get(key: string, noCache?: boolean): Item<TValue>` for single `Item` or
`getAll(keys: any, prev?: Items<TValue>, noCache?: boolean): Items<TValue>` for multiple `Items`.

Values from `MapStore` are returned in an `Item` object with:

- `Status` property for item loading status (check `API` for `ItemStatus`) and
- `Value` for actual value of requested item.

Once `get` or `getAll` is called, `MapStore` invokes method `requestData(keys: string[]): Promise<{[key: string]: TValue }>` passing all not cached keys as an argument.

`requestData` is an abstract method that must be implemented when creating a `MapStore`. It fetches data from data source and place it into a `MapStore`.

```ts
import { MapStore } from "simplr-flux";

export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

type PostsDictionary = { [key: string]: Post };

class PostsStoreClass extends MapStore<Post> {
    protected async requestData(keys: string[]): Promise<PostsDictionary> {
        let promises: Promise<void>[] = [];
        let postsDictionary: PostsDictionary = {};

        for (let key of keys) {
            const promise = fetch(`https://jsonplaceholder.typicode.com/posts/${key}`)
                .then(data => data.json())
                .then((data: Post) => {
                    postsDictionary[key] = data;
                });
            promises.push(promise);
        }
        await Promise.all(promises);

        return postsDictionary;
    }
}

export const PostsStore = new PostsStoreClass();
```

### DataStore

Coming soon...

## Container

To keep `Views` up to date with the latest data from stores we recommend you to use `flux/utils` [Container](https://facebook.github.io/flux/docs/flux-utils.html#container).

```ts
import * as React from "react";
import { Item, ItemStatus } from "simplr-flux/abstractions";
import { Container } from "flux/utils";

import { PostsStore, Post } from "./posts-store";

import { PostView } from "./post-view";

interface State {
    Post: Item<Post>;
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
            case ItemStatus.Init: return <div>Post loading initialized.</div>;
            case ItemStatus.Pending: return <div>Post loading pending.</div>;
            case ItemStatus.Loaded: {
                return <PostView
                    id={this.state.Post.Value!.id}
                    title={this.state.Post.Value!.title}
                    body={this.state.Post.Value!.body}
                />;
            }
            case ItemStatus.NoData: return <div>No post found.</div>;
            case ItemStatus.Failed: return <div>Failed to load post.</div>;
        }
    }
}

export const PostsContainer = Container.create(PostsContainerClass, { withProps: true });

```

## API


### `export class DispatcherBuilder extends flux.Dispatcher<DispatcherMessage<any>>`

Documentation of [`flux.Dispatcher`](https://facebook.github.io/flux/docs/dispatcher.html).

```ts
export interface DispatcherMessage<TAction> {
    action: TAction;
}
```

#### `public dispatch<TAction>(dispatcherMessage: TAction): void`

Dispatches a payload to all registered callbacks.

| Argument            | Type                        | Description                 |
|---------------------|-----------------------------|-----------------------------|
| `dispatcherMessage` | `TAction`                   | Instance of class.          |

----------------------------------------------------------------------------------------------------------

### `export abstract class ReduceStore<TState> extends FluxReduceStore<TState, DispatcherMessage<any>>`

<a name="reduce-store"></a>

Documentation of [`FluxReduceStore`](https://facebook.github.io/flux/docs/flux-utils.html#reducestore-t).

`TState` - store state.

#### `constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>)`

Creates an instance of ReduceStore.

| Argument            | Type                                        | Description                 |
|---------------------|---------------------------------------------|-----------------------------|
| `dispatcher`        | `Flux.Dispatcher<DispatcherMessage<any>>`   | Dispatcher instance.        |

#### `protected registerAction<TClass>(action: Function, handler: ActionHandler<TClass, TState>): void`

Registers specified action handler in this store.

`TClass` - action class.

`TState` - store state.

```ts
export type ActionHandler<TClass, TState> = (action: TClass, state: TState) => TState | void;
```

| Argument      | Type                              | Description                                                   |
|---------------|-----------------------------------|---------------------------------------------------------------|
| `action`      | Function                          | Action class function (in TypeScript - class itself).         |
| `handler`     | ActionHandler<TClass, TState>     | Action handler function.                                      |

#### `abstract getInitialState(): TState;`

`TState` - store state.

Constructs the initial state for this store.
This is called once during construction of the store.

#### `getState(): TState`

Getter that exposes the entire state of this store.

#### `protected cleanUpStore(): void`

Cleans up all store data.
This method is only available in the middle of a dispatch!

#### `protected get currentSession(): number`

Return current session timestamp.

#### `getDispatcher(): DispatcherBuilder`

Return the dispatcher for this store.

#### `protected storeWillCleanUp: undefined | StoreWillCleanup<TState>`

```ts
export type StoreWillCleanup<TState> = () => void | TState;
```

`TState` - store state.

Method is invoked immediately before a store began to clean the state.
It's called in the middle of a dispatch cycle.
If state returned in this method, it's used for initial state.

#### `protected shouldHandleAction(action: Object, state: TState): boolean`

Checks if action should handled. By default always returns true.

| Argument      | Type     | Description                 |
|---------------|----------|-----------------------------|
| `action`      | Object   | Action payload data.        |
| `state`       | TState   | Updated store state.        |


----------------------------------------------------------------------------------------------------------

### Abstractions

### Actions emitter

### Actions

[check this](#reduce-store)


## License

Released under the [AGPL-3.0](./LICENSE).
