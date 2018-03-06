import { Dispatcher } from "../dispatcher";

it("dummy test", () => {
    const dispatchId = Dispatcher.register(() => {});
    expect(typeof dispatchId).toBe("string");
});
