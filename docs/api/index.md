# Table of contents

* [index.ts][SourceFile-0]
    * Interfaces
        * [DispatcherMessage][InterfaceDeclaration-0]
    * Types
        * [ActionHandler][TypeAliasDeclaration-1]
        * [StoreWillCleanup][TypeAliasDeclaration-0]
    * Variables
        * [Dispatcher][VariableDeclaration-0]
        * [Emitter][VariableDeclaration-1]

# index.ts

## Interfaces

### DispatcherMessage

```typescript
interface DispatcherMessage<TAction> {
    action: TAction;
}
```

**Type parameters**

| Name    |
| ------- |
| TAction |

**Properties**

| Name   | Type    | Optional |
| ------ | ------- | -------- |
| action | TAction | false    |

## Types

### ActionHandler

```typescript
type ActionHandler<TClass, TState> = (action: TClass, state: TState) => TState | void;
```

**Type parameters**

| Name   |
| ------ |
| TClass |
| TState |

**Type**

(action: TClass, state: TState) => TState | void

----------

### StoreWillCleanup

```typescript
type StoreWillCleanup<TState> = () => TState | void;
```

**Type parameters**

| Name   |
| ------ |
| TState |

**Type**

() => TState | void

## Classes

### [DispatcherClass][ClassDeclaration-0]


----------

### [MapStore][ClassDeclaration-1]

MapStore to cache data by id.


----------

### [DataStore][ClassDeclaration-7]


----------

### [ReduceStore][ClassDeclaration-6]


## Namespaces

### [Actions][NamespaceImport-0]


----------

### [Abstractions][NamespaceImport-1]


----------

### [Contracts][NamespaceImport-2]


----------

### [Helpers][NamespaceImport-3]


## Variables

### Dispatcher

```typescript
const Dispatcher: DispatcherClass;
```

**Type**

[DispatcherClass][ClassDeclaration-0]

----------

### Emitter

```typescript
const Emitter: ActionEmitter;
```

**Type**

ActionEmitter

[SourceFile-0]: index.md#indexts
[InterfaceDeclaration-0]: index.md#dispatchermessage
[TypeAliasDeclaration-1]: index.md#actionhandler
[TypeAliasDeclaration-0]: index.md#storewillcleanup
[ClassDeclaration-0]: index/dispatcherclass.md#dispatcherclass
[ClassDeclaration-1]: index/mapstore.md#mapstore
[ClassDeclaration-7]: index/datastore.md#datastore
[ClassDeclaration-6]: index/reducestore.md#reducestore
[NamespaceImport-0]: index/actions.md#actions
[NamespaceImport-1]: index/abstractions.md#abstractions
[NamespaceImport-2]: index/contracts.md#contracts
[NamespaceImport-3]: index/helpers.md#helpers
[VariableDeclaration-0]: index.md#dispatcher
[ClassDeclaration-0]: index/dispatcherclass.md#dispatcherclass
[VariableDeclaration-1]: index.md#emitter