# simplr-flux

Flux implementation that enables you to handle actions by their type, without nasty and never ending if or switch trees.

The package is most useful when used with [TypeScript](https://www.typescriptlang.org/) and [React](https://www.typescriptlang.org/).

## Get started

```sh
npm install simplr-flux --save
```

## Concepts

Basic concepts of SimplrFlux are no different from [original flux](https://facebook.github.io/flux/) [concepts](https://github.com/facebook/flux/tree/master/examples/flux-concepts).

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
Actions are registered in store's `constructor` using protected method [`registerAction`](#register-action) which takes `action` class and `handler` function as arguments (check [`API`](#reduce-store-api) section).
Changed store state should be returned as a result of `handler` function.

Accessing data can be accomplished using public method [`getState(): StoreState`](#get-state) or you may implement additional public getters by yourself (e. g. public getter `Count()` in example bellow).

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

[`MapStore`]  is a key-value store with a state of [Immutable.Map](https://facebook.github.io/immutable-js/docs/#/Map).

To get values from `MapStore` you should use public methods [`get`](#map-store-get) for single item or
[`getAll`](#map-store-getAll) for multiple items.

Values from `MapStore` are returned in an [`Item`](#item-class) object with:

- `Status` property for item loading status (check [`API`](#api) for [`ItemStatus`](#item-status)) and
- `Value` for actual value of requested item

If values requested with `getAll` items will be returned in an [`Immutable.Map<string, Items>`](#items).

Once `get` or `getAll` is called, `MapStore` invokes method [`requestData`](#map-store-requestData) where pass all not cached keys as an argument.

[`requestData`](#map-store-requestData) is an abstract method that must be implemented when creating a `MapStore`. It fetches data from server or other data source and place it into a `MapStore`.

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

<a name="api"></a>

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

<a name="abstractions"></a>

### `Abstractions`

<a name="item-status"></a>

#### ItemStatus

Item status in `MapStore` and `DataStore` states.

```ts
export const enum ItemStatus {
    Init = 0,
    Pending = 8,
    Loaded = 16,
    NoData = 64,
    Failed = 128
}
```

<a name="item-class"></a>

#### `export class Item<T>`

`T` - item type.

##### `constructor(status?: ItemStatus, value?: T)`

Creates an instance of Item.

| Argument      | Type          | Initial value         | Description           |
|---------------|---------------|-----------------------|-----------------------|
| `status`      | ItemStatus    | ItemStatus.Init       | Item status.          |
| `value`       | T             | undefined             | Item value.           |

##### `public readonly Status: ItemStatus`

Item status.

##### `public readonly Value: Readonly<T> | undefined`

Item value.

<a name="items-type"></a>

#### `export type Items<T> = Immutable.Map<string, Item<T>>`

`T` - item type.

Type of items in `MapStore` state.

Documentation of [`Immutable.Map`](https://facebook.github.io/immutable-js/docs/#/Map).

----------------------------------------------------------------------------------------------------------

<a name="reduce-store-api"></a>

### `export abstract class ReduceStore<TState> extends FluxReduceStore<TState, DispatcherMessage<any>>`

Documentation of [`FluxReduceStore`](https://facebook.github.io/flux/docs/flux-utils.html#reducestore-t).

`TState` - store state.

#### `constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>)`

Creates an instance of ReduceStore.

| Argument            | Type                                        | Description                 |
|---------------------|---------------------------------------------|-----------------------------|
| `dispatcher`        | `Flux.Dispatcher<DispatcherMessage<any>>`   | Dispatcher instance.        |

<a name="register-action"></a>

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

<a name="get-state"></a>

#### `getState(): TState`

Getter that exposes the entire state of this store.

#### `protected cleanUpStore(): void`

Cleans up all store data.
This method is only available in the middle of a dispatch!

#### `protected get currentSession(): number`

Returns current session timestamp.

#### `getDispatcher(): DispatcherBuilder`

Returns the dispatcher for this store.

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

<a name="map-store"></a>

### `export abstract class MapStore<TValue> extends ReduceStore<Items<TValue>>`

Documentation of [ReduceStore](#reduce-store-api).

`TValue` - type of `MapStore` item value.

`Items` - check API section [`Abstractions Items`](#items-type).

#### `constructor(): void`

Creates an instance of MapStore.

<a name="map-store-requestData"></a>

#### protected abstract requestData

```ts
protected abstract requestData(
    ids: string[],
    onSuccess?: (values: { [id: string]: TValue }) => void,
    onFailed?: (values?: { [id: string]: ItemStatus } | string[]) => void
): Promise<{ [id: string]: TValue }> | void;
```

API call to get data from server or other data source.

Returns dictionary of resolved values.

| Argument      | Type                                                          | Description                                   |
|---------------|---------------------------------------------------------------|-----------------------------------------------|
| `ids`         | string[]                                                      | List of requesting ids.                       |
| `onSuccess`   | (values: { [id: string]: TValue }) => void                    | Success callback with items that succeeded.   |
| `onFailed`    | (values?: { [id: string]: ItemStatus } \| string[]) => void   | Failure callback with items statuses.         |

<a name="map-store-get"></a>

#### `public get(key: string, noCache: boolean = false): Item<TValue>`

`TValue` - type of `MapStore` item value.

Get the value of a particular key.

Returns undefined `Value` and status if the key does not exist in the cache (check [`Item`](#item-class)).

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `key`         | string                      | Requested item key.                                         |
| `noCache`     | boolean                     | Update cached item from the server or other data source.    |

<a name="map-store-getAll"></a>

#### `public getAll(keys: any, prev?: Items<TValue>, noCache: boolean = false): Items<TValue>`

`TValue` - type of `MapStore` item value.

Gets an array of keys and puts the values in a map if they exist, it allows providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same reference if the keys did not change.

Returns requested data map.

| Argument      | Type                                          | Description                                                 |
|---------------|-----------------------------------------------|-------------------------------------------------------------|
| `keys`        | string[] \| Immutable.List\<string\>          | Requested keys list in an `Array` or an `ImmutableList`.    |
| `prev`        | Items\<TValue>                                | Previous data map merged with new data map.                 |
| `noCache`     | Items\<TValue>                                | Update cached item from the server or other data source.    |

#### `public has(key: string): boolean`

Checks if the cache has a particular key.

Returns boolean value that defines whether cache has a particular key.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `key`         | string                      | Requested item key.                                         |

#### `public Prefetch(key: string, noCache: boolean = false): void`

Prefetch item by key.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `key`         | string                      | Requested item key.                                         |
| `noCache`     | boolean                     | Update cached item from the server or other data source.    |

#### `public PrefetchAll(keys: string[], noCache: boolean = false): void`

Prefetch all items by keys.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `keys`        | string[]                    | Requested items keys.                                       |
| `noCache`     | boolean                     | Update cached item from the server or other data source.    |

#### `public InvalidateCache(key: string): void`

Removes item from cache, if it exists.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `key`         | string                      | Requested item key.                                         |

#### `public InvalidateCacheMultiple(keys: string[]): void`

Removes multiple items from cache, if they exist.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `keys`        | string[]                    | Requested items key.                                         |

#### `public getInitialState(): Items<TValue>`

`TValue` - type of `MapStore` item value.

Constructs the initial state for this store. This is called once during construction of the store.

Returns initial empty state.

#### `public at(key: string): Item<TValue> | undefined`

`TValue` - type of `MapStore` item value.

Access the value at the given key.

Returns undefined if the key does not exist in the cache.

| Argument      | Type                        | Description                                                 |
|---------------|-----------------------------|-------------------------------------------------------------|
| `key`         | string                      | Requested item key.                                         |

#### `protected RequestsIntervalInMs: number`

With a large amount of requests `MapStore` throttles them. This property defines interval between portions of requests.

#### `protected storeWillCleanUp: () => void`

`storeWillCleanUp` property holds a function that will be invoked before store clean up.

----------------------------------------------------------------------------------------------------------

### `export abstract class DataStore extends ReduceStore<Items<any>>`

Documentation of [ReduceStore](#reduce-store-api).

`Items` - check API section [`Abstractions Items`](#items-type).

#### `constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>): void`

Creates an instance of DataStore.

#### `getInitialState(): Items<any>`

Constructs the initial state for this store. This is called once during construction of the store.

#### `protected getValueFromState<TValue>(key: string, promiseFactory: () => Promise<TValue>, noCache: boolean = false): Item<TValue>`

`TValue` - type of specific `DataStore` item value.

Returns specified item value. Starts resolving data with `promiseFactory`.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `key`             | string                      | Item key.                                                   |
| `promiseFactory`  | () => Promise\<TValue>      | Function that returns promise of value to be resolved.      |
| `noCache`         | boolean                     | Update cached item from the server or other data source.    |

#### `protected has(key: string): boolean`

Checks if the cache has a particular key.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `key`             | string                      | Item key.                                                   |

#### `protected invalidateCache(key: string): void`

Removes item from cache, if it exists.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `key`             | string                      | Item key.                                                   |

#### `protected invalidateCacheMultiple(keys: string[]): void`

Remove multiple items from cache, if they exist.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `keys`            | string[]                    | Items keys.                                                 |

----------------------------------------------------------------------------------------------------------

### `Actions`

#### `export class DataMapStoreUpdatedAction`

Action that informs about `MapStore` update.

##### `constructor(private storeId: string)`

Creates instance of `DataMapStoreUpdateAction` class.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `storeId`         | string                      | Id of updated store.                                        |

##### `get StoreId()`

Returns id of updated store.

#### `export class DataMapStoreCleanUpAction`

Action that informs about initialized `MapStore` clean up.

##### `constructor(private storeId: string)`

Creates instance of `DataMapStoreCleanUpAction` class.

| Argument          | Type                        | Description                                                 |
|-------------------|-----------------------------|-------------------------------------------------------------|
| `storeId`         | string                      | Id of cleaned store.                                        |

##### `get StoreId()`

Returns id of cleaned store.

----------------------------------------------------------------------------------------------------------

### Actions emitter

## License

Released under the [AGPL-3.0](./LICENSE).
