export class CountUpAction { }

export class CountDownAction { }

// action with no data provided
export class ResetCountAction { }

// action with additional data provided
export class CountChangedAction {
    constructor(private count: number) {}

    public get Count() {
        return this.count;
    }
}
