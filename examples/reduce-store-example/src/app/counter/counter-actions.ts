// actions with no data provided
export class CountIncrementedAction { }

export class CountDecrementedAction { }

export class CountResetAction { }

// action with additional data provided
export class CountChangedAction {
    constructor(private count: number) {}

    public get Count() {
        return this.count;
    }
}
