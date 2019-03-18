import "jest-dom/extend-expect";

import React from "react";
import { render, cleanup } from "react-testing-library";
import { createDispatcher } from "saga";

import { SagaDispatcher } from "../saga-dispatcher";
import { useDispatcher } from "../../hooks/use-dispatcher";

afterEach(cleanup);

it("gets default dispatcher", () => {
    const testDispatcher = createDispatcher();

    function TestApp(): null {
        const dispatcher = useDispatcher();

        expect(dispatcher).toBe(testDispatcher);
        return null;
    }

    render(
        <SagaDispatcher dispatcher={testDispatcher}>
            <TestApp />
        </SagaDispatcher>
    );
});
