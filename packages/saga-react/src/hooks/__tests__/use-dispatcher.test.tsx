import "jest-dom/extend-expect";

import React from "react";
import { render, cleanup } from "react-testing-library";
import { AppDispatcher } from "saga";

import { useDispatcher } from "../use-dispatcher";

afterEach(cleanup);

it("gets default dispatcher", () => {
    function TestApp(): null {
        const dispatcher = useDispatcher();

        expect(dispatcher).toBe(AppDispatcher);
        return null;
    }

    render(<TestApp />);
});
