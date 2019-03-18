import "jest-dom/extend-expect";

import React from "react";
import { act } from "react-dom/test-utils";
import { render, cleanup } from "react-testing-library";
import { AppDispatcher } from "saga";

import { useStore } from "../use-store";
import { createTestStore, IncrementAction } from "./test-helpers";

let TestStore = createTestStore();

beforeEach(() => {
    TestStore = createTestStore();
});

afterEach(cleanup);

it("get state from store", () => {
    function TestApp(): JSX.Element {
        const { counter } = useStore(TestStore);
        return <span>{counter}</span>;
    }

    const { baseElement } = render(<TestApp />);

    expect(baseElement).toHaveTextContent("0");

    act(() => {
        AppDispatcher.dispatch(new IncrementAction());
    });

    expect(baseElement).toHaveTextContent("1");
});
