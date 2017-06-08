# simplr-flux

Flux implementation that enables you to handle actions by their type, without nasty and never ending if or switch trees.
The package is most useful when used with [TypeScript](https://www.typescriptlang.org/) and [React](https://www.typescriptlang.org/).

## Get started

```sh
npm install simplr-flux --save
```

## Concepts

Basic concepts of simplr-flux are no different from [original flux concepts](https://github.com/facebook/flux/tree/master/examples/flux-concepts).

## Actions

> Actions define the internal API of your application. They capture the ways in which anything might interact with your application.

In SimplrFlux action is basically a class with all necessary data provided.

```ts
// action with no data provided
export class ResetCountAction { }

// action with additional data provided
export class SetCountAction {
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
    SetCountAction
} from "./counter-actions";

export function SetCount(count: number) {
    Dispatcher.dispatch(new SetCountAction(count));
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
    SetCountAction
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

    export function SetCount(count: number) {
        Dispatcher.dispatch(new SetCountAction(count));
    }
}

```

## Stores

> A store is what holds the data of an application. Stores will register with the application's dispatcher so that they can receive actions.

Main difference between store types in SimplrFlux is state management.

In accordance with your data structure you may choose type of store that best fits your data structure.

### ReduceStore

Reduce store `state` can be any `object` and have no structure constraints.

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
    SetCountAction
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
        this.registerAction(SetCountAction, this.onSetCount.bind(this));
    }

    getInitialState(): StoreState {
        return {
            Count: 0
        };
    }

    private onCountDown(action: CountDownAction, state: StoreState) {
        return {
            Count: state.Count - 1
        };
    }

    private onCountUp(action: CountUpAction, state: StoreState) {
        return {
            Count: state.Count + 1
        };
    }

    private onResetCount(action: ResetCountAction, state: StoreState) {
        return this.getInitialState();
    }

    private onSetCount(action: SetCountAction, state: StoreState) {
        return {
            Count: action.Count
        };
    }

    public get Count() {
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

## Container



## API
