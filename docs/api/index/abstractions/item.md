# Table of contents

* [Item][ClassDeclaration-3]
    * Constructor
        * [constructor(status, value)][Constructor-2]
    * Properties
        * [status][PropertyDeclaration-2]
        * [value][PropertyDeclaration-3]

# Item

Item class in map store state.

```typescript
class Item<TValue>
```

**Type parameters**

| Name   |
| ------ |
| TValue |
## Constructor

### constructor(status, value)

Constructs new item.

```typescript
public constructor(status: ItemStatus = ItemStatus.Init, value?: TValue | undefined);
```

**Parameters**

| Name   | Type                            | Default value   |
| ------ | ------------------------------- | --------------- |
| status | [ItemStatus][EnumDeclaration-0] | ItemStatus.Init |
| value  | TValue &#124; undefined         |                 |

## Properties

### status

Item status.

```typescript
public readonly status: ItemStatus;
```

**Type**

[ItemStatus][EnumDeclaration-0]

----------

### value

Item value.

```typescript
public readonly value: Readonly<TValue> | undefined;
```

**Type**

Readonly<TValue> | undefined

[ClassDeclaration-3]: item.md#item
[Constructor-2]: item.md#constructorstatus-value
[EnumDeclaration-0]: ../abstractions.md#itemstatus
[PropertyDeclaration-2]: item.md#status
[EnumDeclaration-0]: ../abstractions.md#itemstatus
[PropertyDeclaration-3]: item.md#value