# Table of contents

* [DispatcherClass][ClassDeclaration-0]
    * Methods
        * [dispatch(dispatcherMessage)][MethodDeclaration-0]

# DispatcherClass

```typescript
class DispatcherClass
```
## Methods

### dispatch(dispatcherMessage)

Dispatches a payload to all registered callbacks.

```typescript
public dispatch<TAction extends {}>(dispatcherMessage: DispatcherMessage<TAction>): void;
```

**Type parameters**

| Name    | Constraint |
| ------- | ---------- |
| TAction | {}         |

**Parameters**

| Name              | Type                                                 | Description                                 |
| ----------------- | ---------------------------------------------------- | ------------------------------------------- |
| dispatcherMessage | [DispatcherMessage][InterfaceDeclaration-0]<TAction> | Payload with action as instance of a class. |

**Return type**

void

[ClassDeclaration-0]: dispatcherclass.md#dispatcherclass
[MethodDeclaration-0]: dispatcherclass.md#dispatchdispatchermessage
[InterfaceDeclaration-0]: ../index.md#dispatchermessage