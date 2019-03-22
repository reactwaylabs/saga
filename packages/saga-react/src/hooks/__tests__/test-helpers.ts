import { createStore, Store, handleActions, FSA, createAction } from "saga";

interface Increment extends FSA {
    type: "INCREMENT";
    payload: {
        plusCount: number;
    };
}

interface Decrement extends FSA {
    type: "DECREMENT";
    payload: {
        minusCount: number;
    };
}

export const incrementActionCreator = (amount = 1) => createAction<Increment>("INCREMENT", { plusCount: amount });
export const decrementActionCreator = (amount = 1) => createAction<Decrement>("DECREMENT", { minusCount: amount });

type StoreActions = Increment | Decrement;

export interface TestStoreState {
    counter: number;
}

export function createTestStore(): Store<TestStoreState> {
    return createStore<TestStoreState, StoreActions>({
        name: "test-store",
        initialState: {
            counter: 0
        },
        reducer: handleActions<TestStoreState, StoreActions>({
            INCREMENT: (state, action) => {
                return {
                    counter: state.counter + action.payload.plusCount
                };
            },
            DECREMENT: (state, action) => {
                return {
                    counter: state.counter - action.payload.minusCount
                };
            }
        })
    });
}
