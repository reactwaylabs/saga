import { createStore, Store, combineHandlers, handleClassAction } from "saga";

export class IncrementAction {
    constructor(private _plusCount: number = 1) {}

    public get plusCount(): number {
        return this._plusCount;
    }
}

export class DecrementAction {
    constructor(private _minusCount: number = 1) {}

    public get minusCount(): number {
        return this._minusCount;
    }
}

export interface TestStoreState {
    counter: number;
}

export function createTestStore(): Store<TestStoreState> {
    return createStore<TestStoreState>({
        name: "test-store",
        initialState: {
            counter: 0
        },
        reducer: combineHandlers([
            handleClassAction(IncrementAction, (state, action) => {
                return {
                    counter: state.counter + action.plusCount
                };
            }),
            handleClassAction(DecrementAction, (state, action) => {
                return {
                    counter: state.counter - action.minusCount
                };
            })
        ])
    });
} 
