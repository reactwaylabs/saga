# Table of contents

* [MapStore][ClassDeclaration-1]
    * Constructor
        * [constructor(dispatcher)][Constructor-0]
    * Methods
        * [dispatchSynchronizationAction()][MethodDeclaration-14]
        * [requestData(ids)][MethodDeclaration-15]
        * [getState()][MethodDeclaration-16]
        * [get(key)][MethodDeclaration-17]
        * [isCached(key)][MethodDeclaration-18]
        * [invalidateCache(keys)][MethodDeclaration-19]
        * [prefetch(key)][MethodDeclaration-20]
        * [prefetchAll(keys)][MethodDeclaration-21]
        * [prefetchAll(keys)][MethodDeclaration-22]
        * [prefetchAll(keys)][MethodDeclaration-23]
        * [prefetchAll(keys)][MethodDeclaration-24]
        * [prefetchAll(keys)][MethodDeclaration-25]
        * [getAll(keys, prev)][MethodDeclaration-26]
        * [getAll(keys, prev)][MethodDeclaration-27]
        * [getAll(keys, prev)][MethodDeclaration-28]
        * [getAll(keys, prev)][MethodDeclaration-29]
        * [getAll(keys, prev)][MethodDeclaration-30]
        * [getInitialState()][MethodDeclaration-31]
        * [synchronizeMapStoreHandler(action, state)][MethodDeclaration-32]
        * [synchronizeStoreStateWithRequestsBuffer(action, state, requestsBuffer, dispatchToken)][MethodDeclaration-33]
    * Properties
        * [requestsBuffer][PropertyDeclaration-0]
        * [invalidationBuffer][PropertyDeclaration-5]
        * [dataFetchThrottleTime][GetAccessor-2]
        * [dataFetchThrottleTime][SetAccessor-1]
        * [_state][PropertyDeclaration-6]

# MapStore

MapStore to cache data by id.

```typescript
abstract class MapStore<TValue>
```

**Type parameters**

| Name   |
| ------ |
| TValue |
## Constructor

### constructor(dispatcher)

Creates an instance of MapStore.

```typescript
public constructor(dispatcher?: Dispatcher<DispatcherMessage<any>> | undefined<DispatcherMessage<any>>);
```

**Parameters**

| Name       | Type                                                                                                  | Description          |
| ---------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| dispatcher | Dispatcher<DispatcherMessage<any>> &#124; undefined<[DispatcherMessage][InterfaceDeclaration-0]<any>> | Dispatcher instance. |

## Methods

### dispatchSynchronizationAction()

```typescript
protected dispatchSynchronizationAction(): void;
```

**Return type**

void

----------

### requestData(ids)

An abstract method to provide data for requested ids.

```typescript
protected abstract requestData(ids: string[]): Promise<RequestDataHandlerResult<TValue>>;
```

**Parameters**

| Name | Type     | Description            |
| ---- | -------- | ---------------------- |
| ids  | string[] | List of requested ids. |

**Return type**

Promise<[RequestDataHandlerResult][InterfaceDeclaration-2]<TValue>>

----------

### getState()

Getter that exposes the entire state of this store.
If your state is not immutable you should override this and not expose state directly.

```typescript
public getState(): Map<TValue>;
```

**Return type**

Map<TValue>

----------

### get(key)

Gets the value of a particular key and
returns Value: undefined and status:init if the key does not exist in the cache.

```typescript
public get(key: string): Item<TValue>;
```

**Parameters**

| Name | Type   | Description         |
| ---- | ------ | ------------------- |
| key  | string | Requested item key. |

**Return type**

[Item][ClassDeclaration-3]<TValue>

----------

### isCached(key)

```typescript
public isCached(key: string): boolean;
```

**Parameters**

| Name | Type   |
| ---- | ------ |
| key  | string |

**Return type**

boolean

----------

### invalidateCache(keys)

Invalidates item if it exists in the cache.

```typescript
public invalidateCache(keys: string | string[]): void;
```

**Parameters**

| Name | Type                   |
| ---- | ---------------------- |
| keys | string &#124; string[] |

**Return type**

void

----------

### prefetch(key)

Prefetch item by key.

```typescript
public prefetch(key: string): void;
```

**Parameters**

| Name | Type   | Description         |
| ---- | ------ | ------------------- |
| key  | string | Requested item key. |

**Return type**

void

----------

### prefetchAll(keys)

Prefetch all items by keys.

```typescript
public prefetchAll(keys: string[]): void;
```

**Parameters**

| Name | Type     | Description          |
| ---- | -------- | -------------------- |
| keys | string[] | Requested item keys. |

**Return type**

void

----------

### prefetchAll(keys)

Prefetch all items by keys.

```typescript
public prefetchAll(keys: List<string>): void;
```

**Parameters**

| Name | Type         |
| ---- | ------------ |
| keys | List<string> |

**Return type**

void

----------

### prefetchAll(keys)

Prefetch all items by keys.

```typescript
public prefetchAll(keys: Set<string>): void;
```

**Parameters**

| Name | Type        |
| ---- | ----------- |
| keys | Set<string> |

**Return type**

void

----------

### prefetchAll(keys)

Prefetch all items by keys.

```typescript
public prefetchAll(keys: OrderedSet<string>): void;
```

**Parameters**

| Name | Type               |
| ---- | ------------------ |
| keys | OrderedSet<string> |

**Return type**

void

----------

### prefetchAll(keys)

Prefetch all items by keys.

```typescript
public prefetchAll(keys: any): void;
```

**Parameters**

| Name | Type |
| ---- | ---- |
| keys | any  |

**Return type**

void

----------

### getAll(keys, prev)

Gets an array of keys and puts the values in a map if they exist, it allows
providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same
reference if the keys did not change.

```typescript
public getAll(keys: string[], prev?: Map<string, Item<TValue>> | undefined<TValue>): Map<TValue>;
```

**Parameters**

| Name | Type                                               | Description                                     |
| ---- | -------------------------------------------------- | ----------------------------------------------- |
| keys | string[]                                           | Requested keys list in Array or Immutable List. |
| prev | Map<string, Item<TValue>> &#124; undefined<TValue> | Previous data list merged with new data list.   |

**Return type**

Map<TValue>

----------

### getAll(keys, prev)

Gets an array of keys and puts the values in a map if they exist, it allows
providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same
reference if the keys did not change.

```typescript
public getAll(keys: List<string>, prev?: Map<string, Item<TValue>> | undefined<TValue>): Map<TValue>;
```

**Parameters**

| Name | Type                                               |
| ---- | -------------------------------------------------- |
| keys | List<string>                                       |
| prev | Map<string, Item<TValue>> &#124; undefined<TValue> |

**Return type**

Map<TValue>

----------

### getAll(keys, prev)

Gets an array of keys and puts the values in a map if they exist, it allows
providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same
reference if the keys did not change.

```typescript
public getAll(keys: Set<string>, prev?: Map<string, Item<TValue>> | undefined<TValue>): Map<TValue>;
```

**Parameters**

| Name | Type                                               |
| ---- | -------------------------------------------------- |
| keys | Set<string>                                        |
| prev | Map<string, Item<TValue>> &#124; undefined<TValue> |

**Return type**

Map<TValue>

----------

### getAll(keys, prev)

Gets an array of keys and puts the values in a map if they exist, it allows
providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same
reference if the keys did not change.

```typescript
public getAll(keys: OrderedSet<string>, prev?: Map<string, Item<TValue>> | undefined<TValue>): Map<TValue>;
```

**Parameters**

| Name | Type                                               |
| ---- | -------------------------------------------------- |
| keys | OrderedSet<string>                                 |
| prev | Map<string, Item<TValue>> &#124; undefined<TValue> |

**Return type**

Map<TValue>

----------

### getAll(keys, prev)

Gets an array of keys and puts the values in a map if they exist, it allows
providing a previous result to update instead of generating a new map.

Providing a previous result allows the possibility of keeping the same
reference if the keys did not change.

```typescript
public getAll(keys: string[] | List<string> | Set<string> | OrderedSet<string>, prev?: Map<string, Item<TValue>> | undefined<TValue>): Map<TValue>;
```

**Parameters**

| Name | Type                                                                      |
| ---- | ------------------------------------------------------------------------- |
| keys | string[] &#124; List<string> &#124; Set<string> &#124; OrderedSet<string> |
| prev | Map<string, Item<TValue>> &#124; undefined<TValue>                        |

**Return type**

Map<TValue>

----------

### getInitialState()

Constructs the initial state for this store.
This is called once during construction of the store.

```typescript
public getInitialState(): Map<TValue>;
```

**Return type**

Map<TValue>

----------

### synchronizeMapStoreHandler(action, state)

```typescript
protected synchronizeMapStoreHandler(action: SynchronizeMapStoreAction, state: Map<TValue>): Map<TValue>;
```

**Parameters**

| Name   | Type                                            |
| ------ | ----------------------------------------------- |
| action | [SynchronizeMapStoreAction][ClassDeclaration-5] |
| state  | Map<TValue>                                     |

**Return type**

Map<TValue>

----------

### synchronizeStoreStateWithRequestsBuffer(action, state, requestsBuffer, dispatchToken)

Static and pure synchronization function (for easier testing)

```typescript
protected static synchronizeStoreStateWithRequestsBuffer<TValue>(action: SynchronizeMapStoreAction, state: Map<TValue>, requestsBuffer: RequestsBuffer<TValue>, dispatchToken: string): Map<TValue>;
```

**Type parameters**

| Name   |
| ------ |
| TValue |

**Parameters**

| Name           | Type                                            |
| -------------- | ----------------------------------------------- |
| action         | [SynchronizeMapStoreAction][ClassDeclaration-5] |
| state          | Map<TValue>                                     |
| requestsBuffer | RequestsBuffer<TValue>    |
| dispatchToken  | string                                          |

**Return type**

Map<TValue>

## Properties

### requestsBuffer

```typescript
protected requestsBuffer: RequestsBuffer<TValue>;
```

**Type**

RequestsBuffer<TValue>

----------

### invalidationBuffer

```typescript
protected invalidationBuffer: InvalidationBuffer<TValue>;
```

**Type**

InvalidationBuffer<TValue>

----------

### dataFetchThrottleTime

With a large amount of requests MapStore debounces them.
This property defines interval between portions of requests.

```typescript
protected get dataFetchThrottleTime: number;
```

**Type**

number

----------

### dataFetchThrottleTime

With a large amount of requests MapStore debounces them.
This property defines interval between portions of requests.

```typescript
protected set dataFetchThrottleTime: number;
```

**Type**

number

----------

### _state

```typescript
protected _state: Map<TValue>;
```

**Type**

Map<TValue>

[ClassDeclaration-1]: mapstore.md#mapstore
[Constructor-0]: mapstore.md#constructordispatcher
[InterfaceDeclaration-0]: ../index.md#dispatchermessage
[MethodDeclaration-14]: mapstore.md#dispatchsynchronizationaction
[MethodDeclaration-15]: mapstore.md#requestdataids
[InterfaceDeclaration-2]: contracts.md#requestdatahandlerresult
[MethodDeclaration-16]: mapstore.md#getstate
[MethodDeclaration-17]: mapstore.md#getkey
[ClassDeclaration-3]: abstractions/item.md#item
[MethodDeclaration-18]: mapstore.md#iscachedkey
[MethodDeclaration-19]: mapstore.md#invalidatecachekeys
[MethodDeclaration-20]: mapstore.md#prefetchkey
[MethodDeclaration-21]: mapstore.md#prefetchallkeys
[MethodDeclaration-22]: mapstore.md#prefetchallkeys
[MethodDeclaration-23]: mapstore.md#prefetchallkeys
[MethodDeclaration-24]: mapstore.md#prefetchallkeys
[MethodDeclaration-25]: mapstore.md#prefetchallkeys
[MethodDeclaration-26]: mapstore.md#getallkeys-prev
[MethodDeclaration-27]: mapstore.md#getallkeys-prev
[MethodDeclaration-28]: mapstore.md#getallkeys-prev
[MethodDeclaration-29]: mapstore.md#getallkeys-prev
[MethodDeclaration-30]: mapstore.md#getallkeys-prev
[MethodDeclaration-31]: mapstore.md#getinitialstate
[MethodDeclaration-32]: mapstore.md#synchronizemapstorehandleraction-state
[ClassDeclaration-5]: actions/synchronizemapstoreaction.md#synchronizemapstoreaction
[MethodDeclaration-33]: mapstore.md#synchronizestorestatewithrequestsbufferaction-state-requestsbuffer-dispatchtoken
[ClassDeclaration-5]: actions/synchronizemapstoreaction.md#synchronizemapstoreaction
[PropertyDeclaration-0]: mapstore.md#requestsbuffer
[PropertyDeclaration-5]: mapstore.md#invalidationbuffer
[GetAccessor-2]: mapstore.md#datafetchthrottletime
[SetAccessor-1]: mapstore.md#datafetchthrottletime
[PropertyDeclaration-6]: mapstore.md#_state