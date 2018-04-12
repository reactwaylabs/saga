# Helpers

## Functions

### ItemIsPending

```typescript
function ItemIsPending(status: ItemStatus): boolean;
```

**Parameters**

| Name   | Type                            |
| ------ | ------------------------------- |
| status | [ItemStatus][EnumDeclaration-0] |

**Return type**

boolean

----------

### ItemsStatusResolver

```typescript
function ItemsStatusResolver(statuses: ItemStatus[]): ItemStatus;
```

**Parameters**

| Name     | Type                              |
| -------- | --------------------------------- |
| statuses | [ItemStatus][EnumDeclaration-0][] |

**Return type**

[ItemStatus][EnumDeclaration-0]

----------

### WaitForStoreChange

```typescript
function WaitForStoreChange(store: FluxStore<any>): Promise<void>;
```

**Parameters**

| Name  | Type           |
| ----- | -------------- |
| store | FluxStore<any> |

**Return type**

Promise<void>

[NamespaceImport-3]: helpers.md#helpers
[FunctionDeclaration-0]: helpers.md#itemispending
[EnumDeclaration-0]: abstractions.md#itemstatus
[FunctionDeclaration-1]: helpers.md#itemsstatusresolver
[EnumDeclaration-0]: abstractions.md#itemstatus
[EnumDeclaration-0]: abstractions.md#itemstatus
[FunctionDeclaration-2]: helpers.md#waitforstorechange