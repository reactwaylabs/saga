import { TinyEmitter } from "../emitter";

it("add handlers and remove", () => {
    const emitter = new TinyEmitter();

    expect(emitter.getListenersCount()).toBe(0);
    const remove1 = emitter.addListener(jest.fn());
    expect(emitter.getListenersCount()).toBe(1);
    const remove2 = emitter.addListener(jest.fn());
    const remove3 = emitter.addListener(jest.fn());
    expect(emitter.getListenersCount()).toBe(3);
    remove1();
    remove2();
    remove3();
    expect(emitter.getListenersCount()).toBe(0);
});

it("add one handler and remove", () => {
    const emitter = new TinyEmitter();

    expect(emitter.getListenersCount()).toBe(0);
    const remove1 = emitter.addListener(jest.fn());
    expect(emitter.getListenersCount()).toBe(1);
    remove1();
    expect(emitter.getListenersCount()).toBe(0);
});

it("remove non existant handler", () => {
    const emitter = new TinyEmitter();
    const stub = jest.fn();

    emitter.removeListener(stub);
    expect(emitter.getListenersCount()).toBe(0);
});

it("emit when one handlers is added", () => {
    const emitter = new TinyEmitter();
    const handler1 = jest.fn();

    emitter.addListener(handler1);

    emitter.emit(true);

    expect(handler1.mock.calls.length).toBe(1);
});

it("emit when multiple handlers added", () => {
    const emitter = new TinyEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();

    emitter.addListener(handler1);
    emitter.addListener(handler2);
    emitter.addListener(handler3);

    emitter.emit(true);

    expect(handler1.mock.calls.length).toBe(1);
    expect(handler2.mock.calls.length).toBe(1);
    expect(handler3.mock.calls.length).toBe(1);
});

it("emit when no handlers added", () => {
    const emitter = new TinyEmitter();

    expect(() => emitter.emit()).not.toThrow();
});
