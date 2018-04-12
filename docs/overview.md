# Overview

- [Overview](#overview)
    - [Actions](#actions)
    - [Dispatcher](#dispatcher)
    - [Action creators](#action-creators)
    - [Stores](#stores)
        - [ReduceStore](#reducestore)
        - [MapStore](#mapstore)
        - [DataStore](#datastore)
    - [Container](#container)

## Actions

> Actions define the internal API of your application. They capture the ways in which anything might interact with your application.

In `SimplrFlux` action is basically a class with all necessary data provided.

```ts
// action with no data provided
export class CountIncrementedAction { }

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

To receive the actions you have to register them specifically.

Dispatching is usually performed in [ActionCreators](#action-creators).

```ts
import { Dispatcher } from "simplr-flux";
import {
    CountChangedAction
} from "./counter-actions";

export function CountChanged(count: number) {
    Dispatcher.dispatch(new CountChangedAction(count));
}
```

<a name="action-creators"></a>

## Action creators

An action creator is a set of functions for dispatching actions.
You may choose the way to aggregate these functions,
but we recommend using exported functions within a single namespace when using `TypeScript`.

```ts
import { Dispatcher } from "simplr-flux";
import {
    CountIncrementedAction,
    CountDecrementedAction,
    CountResetAction,
    CountChangedAction
} from "./counter-actions";

export namespace CounterActionsCreators {
    export function CountIncremented() {
        Dispatcher.dispatch(new CountIncrementedAction);
    }

    export function CountDecremented() {
        Dispatcher.dispatch(new CountDecrementedAction);
    }

    export function CountReset() {
        Dispatcher.dispatch(new CountResetAction);
    }

    export function CountChanged(count: number) {
        Dispatcher.dispatch(new CountChangedAction(count));
    }
}
```

## Stores

> A store is what holds the data of an application. Stores will register with the application's dispatcher so that they can receive actions.

Main difference between store types in `SimplrFlux` is state management.

In accordance with your data structure you may choose a type of store that best fits your data structure.

### ReduceStore

ReduceStore `state` can be any `object` and has no structure constraints.

The only way to change `state` of `ReduceStore` is actions `handlers`.
Actions are registered in store's `constructor` using protected method [`registerAction`](#register-action) which takes an `action` class and a `handler` function as arguments (check [`API`](#reduce-store-api) section).

Updated store state should be returned as a result of a `handler` function.

Accessing data can be accomplished using public method [`getState(): StoreState`](#get-state) or you may implement additional public getters yourself (e. g. public getter `Count()` in an example bellow).

```ts
import { ReduceStore } from "simplr-flux";
import {
    CountDecrementedAction,
    CountIncrementedAction,
    CountResetAction,
    CountChangedAction
} from "./counter-actions";

interface StoreState {
    Count: number;
}

class CounterReduceStoreClass extends ReduceStore<StoreState> {
    constructor() {
        super();
        this.registerAction(CountDecrementedAction, this.onCountDecremented.bind(this));
        this.registerAction(CountIncrementedAction, this.onCountIncremented.bind(this));
        this.registerAction(CountResetAction, this.onCountReset.bind(this));
        this.registerAction(CountChangedAction, this.onCountChanged.bind(this));
    }

    private onCountDecremented(action: CountDecrementedAction, state: StoreState): StoreState {
        return {
            Count: state.Count - 1
        };
    }

    private onCountIncremented(action: CountIncrementedAction, state: StoreState): StoreState {
        return {
            Count: state.Count + 1
        };
    }

    private onCountReset(action: CountResetAction, state: StoreState): StoreState {
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

Full working example can be found in [`examples/reduce-store-example`](./examples/reduce-store-example).

### MapStore

[`MapStore`](#map-store) is a key-value store with a state of [Immutable.Map](https://facebook.github.io/immutable-js/docs/#/Map) that keeps key-value pairs of the same value type.

To get values from `MapStore` you should use public methods [`get`](#map-store-get) for a single item or
[`getAll`](#map-store-getAll) for multiple ones.

Values from `MapStore` are returned in an [`Item`](#item-class) object with:

- `Status` property for item loading status (check [`API`](#api) for [`ItemStatus`](#item-status));
- `Value` for actual value of a requested item.

If values requested with `getAll` items will be returned in an [`Immutable.Map<string, Items>`](#items).

Once `get` or `getAll` is called, `MapStore` invokes method [`requestData`](#map-store-requestData) where pass all not cached keys as an argument.

[`requestData`](#map-store-requestData) is an abstract method that must be implemented when creating a `MapStore`. It fetches data from server or other data source and place it into a `MapStore`.

Be aware that `requestData` is always called asynchronously. `MapStore` throttles requests to avoid large amount of requests at a single moment of time. Time between portion of requests can be set using protected property [`RequestsIntervalInMs`](#map-store-request-interval-in-ms).

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
        let promises: Array<Promise<void>> = [];
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

Full working example can be found in [`examples/map-store-example`](./examples/map-store-example).

### DataStore

[`DataStore`](#data-store) is another key-value store with a state of [Immutable.Map](https://facebook.github.io/immutable-js/docs/#/Map). Not like `MapStore` it can hold values of different types.

To get values from `DataStore` you should use a protected method [`getValueFromState`](#data-store-getValueFromState) in public getters of your own implementation.

[`getValueFromState`](#data-store-getValueFromState) is a helper method that takes a unique key of a value to hold and `promiseFactory` - function to resolve this value.

Values resolved by `getValueFromState` are returned in an [`Item`](#item-class) object with.

```ts
import { DataStore } from "simplr-flux";
import { Abstractions } from "simplr-flux";

import * as path from "path";

export interface Address {
    HouseNumber: string;
    City: string;
    Country: string;
    PostCode: string;
    Street: string;
}

export interface PersonalData {
    Name: string;
    LastName: string;
    PhoneNumber: string;
}

const JSONS_FOLDER_NAME = "assets";
const ADDRESS_KEY = "address";
const PERSONAL_DATA_KEY = "personal-data";

class ContactDataStoreClass extends DataStore {

    private constructPath(fileName: string) {
        return path.join(__dirname, JSONS_FOLDER_NAME, fileName);
    }

    private getAddress = async () => {
        try {
            return await SystemJS.import(this.constructPath("address.json!"));
        } catch (error) {
            console.error(error);
        }
    }

    public GetAddress(noCache?: boolean): Abstractions.Item<Address> {
        return this.getValueFromState<Address>(ADDRESS_KEY, this.getAddress, noCache);
    }

    private getPersonalData = async () => {
        try {
            return await SystemJS.import(this.constructPath("personal-data.json!"));
        } catch (error) {
            console.error(error);
        }
    }

    public get PersonalData(): Abstractions.Item<PersonalData> {
        return this.getValueFromState<PersonalData>(PERSONAL_DATA_KEY, this.getPersonalData);
    }

    public InvalidatePersonalData() {
        this.invalidateCache(PERSONAL_DATA_KEY);
    }
}

export const ContactDataStore = new ContactDataStoreClass();
```

Full working example can be found in [`examples/data-store-example`](./examples/data-store-example).

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
