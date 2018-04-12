# Contracts

## Interfaces

### RequestDataHandlerResult

```typescript
interface RequestDataHandlerResult<TItem> {
    [id: string]: TItem | null;
}
```

**Type parameters**

| Name  |
| ----- |
| TItem |
#### Index

```typescript
[id: string]: TItem | null;
```

* *Parameter* `id` - string
* *Type* TItem | null


----------

### RequestDataHandler

```typescript
interface RequestDataHandler<TItem> {
    (ids: string[]): Promise<RequestDataHandlerResult<TItem>>;
}
```

**Type parameters**

| Name  |
| ----- |
| TItem |
#### Call

```typescript
(ids: string[]): Promise<RequestDataHandlerResult<TItem>>;
```

**Parameters**

| Name | Type     |
| ---- | -------- |
| ids  | string[] |

**Return type**

Promise<[RequestDataHandlerResult][InterfaceDeclaration-2]<TItem>>


## Types

### Items

```typescript
type Items<TItem> = Map<string, Item<TItem>>;
```

**Type parameters**

| Name  |
| ----- |
| TItem |

**Type**

Map<string, [Item][ClassDeclaration-3]<TItem>>

[NamespaceImport-2]: contracts.md#contracts
[InterfaceDeclaration-2]: contracts.md#requestdatahandlerresult
[InterfaceDeclaration-1]: contracts.md#requestdatahandler
[InterfaceDeclaration-2]: contracts.md#requestdatahandlerresult
[TypeAliasDeclaration-2]: contracts.md#items
[ClassDeclaration-3]: abstractions/item.md#item