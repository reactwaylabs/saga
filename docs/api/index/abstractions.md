# Abstractions

## Enums

### ItemStatus

Item status in map store state.


```typescript
const enum ItemStatus {
     Init = 0,
     Pending = 8,
     Loaded = 16,
     NoData = 64,
     Failed = 128
}
```

**Members**

| Name    | Value |
| ------- | ----- |
| Init    | 0     |
| Pending | 8     |
| Loaded  | 16    |
| NoData  | 64    |
| Failed  | 128   |

## Classes

### [Item][ClassDeclaration-3]

Item class in map store state.


[NamespaceImport-1]: abstractions.md#abstractions
[EnumDeclaration-0]: abstractions.md#itemstatus
[ClassDeclaration-3]: abstractions/item.md#item