import { DispatcherClass, DispatcherMessage } from "../dispatcher";

class ActionCatcher {
    public lastAction: DispatcherMessage<any> | undefined;
    public actionsCount: number = 0;
    public catch: (payload: DispatcherMessage<any>) => void = payload => {
        this.lastAction = payload;
        this.actionsCount++;
    };
}

let dispatcher: DispatcherClass;
beforeEach(() => {
    dispatcher = new DispatcherClass();
});

it("returns dispatch token on registration", () => {
    // tslint:disable-next-line:no-empty
    const dispatchToken = dispatcher.register((payload: DispatcherMessage<any>) => {});
    expect(typeof dispatchToken === "string").toBe(true);
});

it("dispatches an action to registered listeners", () => {
    const actionCatcher = new ActionCatcher();
    dispatcher.register(actionCatcher.catch);

    expect(actionCatcher.actionsCount).toBe(0);
    expect(actionCatcher.lastAction).toBe(undefined);

    class Action {}

    const action = new Action();
    dispatcher.dispatch(action);

    expect(actionCatcher.actionsCount).toBe(1);
    expect(actionCatcher.lastAction).toBeDefined();
    expect(actionCatcher.lastAction!.action instanceof Action).toBe(true);
});
