# Table of contents

* [ReduceStore][ClassDeclaration-6]
    * Constructor
        * [constructor(dispatcher)][Constructor-4]
    * Methods
        * [reduce(state, payload)][MethodDeclaration-34]
        * [areEqual(startingState, endingState)][MethodDeclaration-35]
        * [getDispatcher()][MethodDeclaration-36]
        * [getInitialState()][MethodDeclaration-37]
        * [shouldHandleAction(action, state)][MethodDeclaration-38]
        * [cleanUpStore()][MethodDeclaration-39]
        * [registerAction(action, handler)][MethodDeclaration-40]
    * Properties
        * [currentSessionTimestamp][GetAccessor-4]
        * [storeWillCleanUp][PropertyDeclaration-7]

# ReduceStore

```typescript
abstract class ReduceStore<TState>
```

**Type parameters**

| Name   |
| ------ |
| TState |
## Constructor

### constructor(dispatcher)

Creates an instance of ReduceStore.

```typescript
public constructor(dispatcher?: Dispatcher<DispatcherMessage<any>> | undefined<DispatcherMessage<any>>);
```

**Parameters**

| Name       | Type                                                                                                  | Description                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| dispatcher | Dispatcher<DispatcherMessage<any>> &#124; undefined<[DispatcherMessage][InterfaceDeclaration-0]<any>> | An instance of Dispatcher to use for incoming payloads and emitting changes. |

## Methods

### reduce(state, payload)

Reduces the current state and given action to a new state of this store.
All subclasses must implement this method.
This method should be pure and have no side-effects.

```typescript
public reduce(state: TState, payload: DispatcherMessage<Function>): TState;
```

**Parameters**

| Name    | Type                                                  | Description                 |
| ------- | ----------------------------------------------------- | --------------------------- |
| state   | TState                                                | Current store state.        |
| payload | [DispatcherMessage][InterfaceDeclaration-0]<Function> | Dispatched payload message. |

**Return type**

TState

----------

### areEqual(startingState, endingState)

Checks if two versions of state are the same.
You do not need to override this.

```typescript
public areEqual(startingState: TState, endingState: TState): boolean;
```

**Parameters**

| Name          | Type   | Description               |
| ------------- | ------ | ------------------------- |
| startingState | TState | Starting state (current). |
| endingState   | TState | Ending state (updated).   |

**Return type**

boolean

----------

### getDispatcher()

Returns the dispatcher for this store.

```typescript
public getDispatcher(): DispatcherClass;
```

**Return type**

[DispatcherClass][ClassDeclaration-0]

----------

### getInitialState()

Constructs the initial state for this store.
This is called once during construction of the store.

```typescript
public abstract getInitialState(): TState;
```

**Return type**

TState

----------

### shouldHandleAction(action, state)

Check if an action should be handled.
By default, this is always true.

```typescript
protected shouldHandleAction(action: Object, state: TState): boolean;
```

**Parameters**

| Name   | Type   | Description          |
| ------ | ------ | -------------------- |
| action | Object | Action payload data. |
| state  | TState | Updated store state. |

**Return type**

boolean

----------

### cleanUpStore()

Cleans up all store data.
This method is only available in the middle of dispatch!

```typescript
protected cleanUpStore(): void;
```

**Return type**

void

----------

### registerAction(action, handler)

Register specified action handler in this store.

```typescript
protected registerAction<TAction>(action: Function, handler: ActionHandler<TAction, TState>): void;
```

**Type parameters**

| Name    |
| ------- |
| TAction |

**Parameters**

| Name    | Type                                                     | Description              |
| ------- | -------------------------------------------------------- | ------------------------ |
| action  | Function                                                 | Action class function.   |
| handler | [ActionHandler][TypeAliasDeclaration-1]<TAction, TState> | Action handler function. |

**Return type**

void

## Properties

### currentSessionTimestamp

Returns a current session timestamp.

```typescript
protected get currentSessionTimestamp: number;
```

**Type**

number

----------

### storeWillCleanUp

Method is invoked immediately before a store began to clean the state.
It's called in the middle of a dispatch cycle.
If a state is returned in this method, it's used as an initial state.

```typescript
protected storeWillCleanUp: undefined | StoreWillCleanup<TState>;
```

**Type**

undefined | [StoreWillCleanup][TypeAliasDeclaration-0]<TState>

[ClassDeclaration-6]: reducestore.md#reducestore
[Constructor-4]: reducestore.md#constructordispatcher
[InterfaceDeclaration-0]: ../index.md#dispatchermessage
[MethodDeclaration-34]: reducestore.md#reducestate-payload
[InterfaceDeclaration-0]: ../index.md#dispatchermessage
[MethodDeclaration-35]: reducestore.md#areequalstartingstate-endingstate
[MethodDeclaration-36]: reducestore.md#getdispatcher
[ClassDeclaration-0]: dispatcherclass.md#dispatcherclass
[MethodDeclaration-37]: reducestore.md#getinitialstate
[MethodDeclaration-38]: reducestore.md#shouldhandleactionaction-state
[MethodDeclaration-39]: reducestore.md#cleanupstore
[MethodDeclaration-40]: reducestore.md#registeractionaction-handler
[TypeAliasDeclaration-1]: ../index.md#actionhandler
[GetAccessor-4]: reducestore.md#currentsessiontimestamp
[PropertyDeclaration-7]: reducestore.md#storewillcleanup
[TypeAliasDeclaration-0]: ../index.md#storewillcleanup