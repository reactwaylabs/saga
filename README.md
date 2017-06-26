# simplr-flux

Flux implementation that enables you to handle actions by their type, without nasty and never ending if or switch trees.

The package is most useful when used with [TypeScript](https://www.typescriptlang.org/) and [React](https://www.typescriptlang.org/).

## Get started

```sh
npm install simplr-flux --save
```

## Concepts

Basic concepts of `SimplrFlux` are no different from [original flux](https://facebook.github.io/flux/) [concepts](https://github.com/facebook/flux/tree/master/examples/flux-concepts).

We also recommend to follow [the best practises](https://facebook.github.io/flux/docs/flux-utils.html#best-practices) proposed by original flux.

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

<a name="api"></a>

## API

### `class DispatcherBuilder`

A class to create `Dispatcher` instances.

```ts
import { DispatcherBuilder } from "simplr-flux";
```

`DispatcherBuilder` extends `flux.Dispatcher`. You can check it's documentation [here](https://facebook.github.io/flux/docs/dispatcher.html).

#### `public dispatch<TAction>(dispatcherMessage: TAction): void`

Dispatches a payload to all registered callbacks.

| Argument            | Type                        | Description                 |
|---------------------|-----------------------------|-----------------------------|
| `dispatcherMessage` | `TAction`                   | Instance of class.          |

#### `register(callback: (payload: TPayload) => void): string`

Registers a callback that will be invoked with every payload sent to the dispatcher.

Returns a string token to identify the callback to be used with waitFor() or unregister.

| Argument            | Type                        | Description                                               |
|---------------------|-----------------------------|-----------------------------------------------------------|
| `callback`          | `TPayload`                  | A callback to be invoked with every dispatched payload.   |

#### `unregister(id: string): void`

Unregisters a callback with the given ID token.

| Argument      | Type             | Description        |
|---------------|------------------|--------------------|
| `id`          | `string`         | Callback token.    |

#### `waitFor(IDs: string[]): void`

Waits for the callbacks with the specified IDs to be invoked before continuing execution of the current callback.

This method should only be used by a callback in response to a dispatched payload.

| Argument      | Type             | Description                                                                                                |
|---------------|------------------|------------------------------------------------------------------------------------------------------------|
| `ids`         | `string[]`       | Array of callbacks tokens specified to be invoked before continuing execution of the current callback.     |

#### `isDispatching(): boolean`

Returns boolean value that defines if this dispatcher is currently dispatching.

### `Dispatcher instance`

`SimplrFlux` exports instance of a dispatcher:

```ts
import { Dispatcher } from "simplr-flux";
```

It is recommended to have only one `Dispatcher` instance per app, so you don't need to create `Dispatcher` instance yourself,
it's already created by `SimplrFlux`.

----------------------------------------------------------------------------------------------------------

<a name="abstractions"></a>

### `Abstractions`

```ts
import { Abstractions } from "simplr-flux";
```

<a name="item-status"></a>

#### `enum ItemStatus`

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

#### `class Item<T>`

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

### `abstract class ReduceStore<TState>`

`TState` - store state.

```ts
import { ReduceStore } from "simplr-flux";
```

`ReduceStore` extends FluxReduceStore from `Facebook Flux`.
Documentation of `FluxReduceStore` can be found [here](https://facebook.github.io/flux/docs/flux-utils.html#reducestore-t).

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

Method is invoked immediately before a store begins to clean the state.
It's called in the middle of a dispatch cycle.
If state returned in this method, it's used for initial state.

#### `protected shouldHandleAction(action: Object, state: TState): boolean`

Checks if action should be handled. By default always returns true.

| Argument      | Type     | Description                 |
|---------------|----------|-----------------------------|
| `action`      | Object   | Action payload data.        |
| `state`       | TState   | Updated store state.        |

----------------------------------------------------------------------------------------------------------

<a name="map-store"></a>

### `abstract class MapStore<TValue>`

```ts
import { MapStore } from "simplr-flux";
```

`MapStore` extends `ReduceStore` of `SimplrFlux`.
Documentation of ReduceStore can be found [here](#reduce-store-api).

State of `MapStore` is a `Items` of type TValue. Check API section for [`Abstractions Items`](#items-type).

`TValue` - type of `MapStore` item value.

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

`Items` - check API section [`Abstractions Items`](#items-type).

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
| `keys`        | string[]                    | Requested items key.                                        |

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

<a name="map-store-request-interval-in-ms"></a>

#### `protected RequestsIntervalInMs: number`

With a large amount of requests `MapStore` throttles them. This property defines interval between portions of requests.

Default value is `50` ms.

#### `protected storeWillCleanUp: () => void`

`storeWillCleanUp` property holds a function that will be invoked before store clean up.

----------------------------------------------------------------------------------------------------------

<a name="data-store"></a>

### `abstract class DataStore`

```ts
import { DataStore } from "simplr-flux";
```

`DataStore` extends `ReduceStore` of `SimplrFlux`. Documentation of `ReduceStore` can be found [here](#reduce-store-api).

State of `DataStore` is a `Items` of `any` value type. Check API section for [`Abstractions Items`](#items-type).

#### `constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>): void`

Creates an instance of DataStore.

#### `getInitialState(): Items<any>`

Constructs the initial state for this store. This is called once during construction of the store.

<a name="data-store-getValueFromState"></a>

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

## References

- [`Action-emitter`](https://github.com/SimplrJS/action-emitter).
- [`Immutable`](https://facebook.github.io/immutable-js/).
- [`Flux`](https://facebook.github.io/flux/).

## License

Released under the [AGPL-3.0](./LICENSE).
