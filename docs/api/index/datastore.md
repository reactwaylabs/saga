# Table of contents

* [DataStore][ClassDeclaration-7]
    * Constructor
        * [constructor(dispatcher)][Constructor-5]
    * Methods
        * [getInitialState()][MethodDeclaration-41]
        * [reduce(state, payload)][MethodDeclaration-42]
        * [getValueFromState(key, promiseFactory, noCache)][MethodDeclaration-43]
        * [has(key)][MethodDeclaration-44]
        * [invalidateCache(key)][MethodDeclaration-45]
        * [invalidateCacheMultiple(keys)][MethodDeclaration-46]

# DataStore

```typescript
abstract class DataStore
```
## Constructor

### constructor(dispatcher)

Creates an instance of DataStore.

```typescript
public constructor(dispatcher?: Dispatcher<DispatcherMessage<any>> | undefined<DispatcherMessage<any>>);
```

**Parameters**

| Name       | Type                                                                                                  | Description          |
| ---------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| dispatcher | Dispatcher<DispatcherMessage<any>> &#124; undefined<[DispatcherMessage][InterfaceDeclaration-0]<any>> | Dispatcher instance. |

## Methods

### getInitialState()

Constructs the initial state for this store.
This is called once during construction of the store.

```typescript
public getInitialState(): Map<any>;
```

**Return type**

Map<any>

----------

### reduce(state, payload)

Reduces the current state, and an action to the new state of this store.
All subclasses must implement this method.
This method should be pure and have no side-effects.

```typescript
public reduce(state: Map<any>, payload: DispatcherMessage<any>): Map<any>;
```

**Parameters**

| Name    | Type                                             | Description                         |
| ------- | ------------------------------------------------ | ----------------------------------- |
| state   | Map<any>                                         | Current store state.                |
| payload | [DispatcherMessage][InterfaceDeclaration-0]<any> | Dispatched message from dispatcher. |

**Return type**

Map<any>

----------

### getValueFromState(key, promiseFactory, noCache)

Return specified item value.
Start resolving data with `promiseFactory`.

```typescript
protected getValueFromState<TValue>(key: string, promiseFactory: () => Promise<TValue>, noCache: boolean = false): Item<TValue> | undefined;
```

**Type parameters**

| Name   |
| ------ |
| TValue |

**Parameters**

| Name           | Type                  | Default value | Description                                        |
| -------------- | --------------------- | ------------- | -------------------------------------------------- |
| key            | string                |               | Item key.                                          |
| promiseFactory | () => Promise<TValue> |               | Function which return promise with value resolver. |
| noCache        | boolean               | false         | Use data without cache.                            |

**Return type**

[Item][ClassDeclaration-3]<TValue> | undefined

----------

### has(key)

Check if the cache has a particular key.

```typescript
protected has(key: string): boolean;
```

**Parameters**

| Name | Type   | Description |
| ---- | ------ | ----------- |
| key  | string | Item key.   |

**Return type**

boolean

----------

### invalidateCache(key)

Remove item from cache, if exist.

```typescript
protected invalidateCache(key: string): void;
```

**Parameters**

| Name | Type   | Description |
| ---- | ------ | ----------- |
| key  | string | Item key.   |

**Return type**

void

----------

### invalidateCacheMultiple(keys)

Remove multiple items from cache, if exist.

```typescript
protected invalidateCacheMultiple(keys: string[]): void;
```

**Parameters**

| Name | Type     | Description |
| ---- | -------- | ----------- |
| keys | string[] | Items keys. |

**Return type**

void

[ClassDeclaration-7]: datastore.md#datastore
[Constructor-5]: datastore.md#constructordispatcher
[InterfaceDeclaration-0]: ../index.md#dispatchermessage
[MethodDeclaration-41]: datastore.md#getinitialstate
[MethodDeclaration-42]: datastore.md#reducestate-payload
[InterfaceDeclaration-0]: ../index.md#dispatchermessage
[MethodDeclaration-43]: datastore.md#getvaluefromstatekey-promisefactory-nocache
[ClassDeclaration-3]: abstractions/item.md#item
[MethodDeclaration-44]: datastore.md#haskey
[MethodDeclaration-45]: datastore.md#invalidatecachekey
[MethodDeclaration-46]: datastore.md#invalidatecachemultiplekeys