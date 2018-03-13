import * as Flux from "flux";
import * as Immutable from "immutable";
import { MapStore } from "../map-store";
import { ItemStatus } from "../../abstractions";
import { RequestDataHandler, RequestDataHandlerResult } from "../../contracts";
import { DispatcherClass, DispatcherMessage } from "../..";
import { RequestsBuffer } from "../../handlers/requests-buffer";

interface TestItem {
    id: string;
    value: number;
}

const items: TestItem[] = [
    { id: "zero", value: 0 },
    { id: "one", value: 1 },
    { id: "two", value: 2 },
    { id: "three", value: 3 },
    { id: "four", value: 4 },
    { id: "five", value: 5 }
];
const itemsMap = items.map<[string, TestItem]>(x => [x.id, Object.freeze(x)]);

// Cache to simulate API
let cache: Immutable.Map<string, TestItem> = Immutable.Map(itemsMap);

class TestMapStore extends MapStore<TestItem> {
    constructor(dispatcher: Flux.Dispatcher<DispatcherMessage<any>>, requestDataHandler: RequestDataHandler<TestItem>) {
        super(dispatcher);
        this.requestDataHandler = requestDataHandler;
        this.dataFetchThrottleTime = 0;
    }
    protected requestData(ids: string[]): Promise<RequestDataHandlerResult<TestItem>> {
        if (this.requestDataHandler == null) {
            throw new Error(`requestDataHandler was not set before TestMapStore usage.`);
        }

        return this.requestDataHandler(ids);
    }
    private requestDataHandler: RequestDataHandler<TestItem>;

    public getTestRequestsBuffer(): RequestsBuffer<TestItem> {
        return this.requestsBuffer;
    }

    public getTestDataFetchThrottleTime(): number {
        return this.dataFetchThrottleTime;
    }

    public setTestDataFetchThrottleTime(value: number): void {
        this.dataFetchThrottleTime = value;
    }
}

class Resolvable<TResult = any> {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        // this.then = this.promise.then;
    }

    public resolve: (value?: TResult | PromiseLike<TResult> | undefined) => void;
    public reject: (reason?: any) => void;
    public promise: Promise<TResult>;
}

let dispatcher: DispatcherClass;
const requestDataSync: RequestDataHandler<TestItem> = async ids => {
    const results: { [id: string]: TestItem } = {};
    for (const id of ids) {
        const result = cache.get(id);
        if (result != null) {
            results[id] = result;
        }
    }

    return results;
};

beforeEach(() => {
    dispatcher = new DispatcherClass();
});

it("should throw if state is being accessed directly from the store", () => {
    const mapStore = new TestMapStore(dispatcher, requestDataSync);
    expect(mapStore.getState).toThrow();
});

it("should return sythetic item with ItemStatus.Init when getting non-cached item", () => {
    const mapStore = new TestMapStore(dispatcher, requestDataSync);

    const item = mapStore.get("any-item-id");
    expect(item).toBeDefined();
    expect(item.status).toBe(ItemStatus.Init);
});

it("should return the same sythetic item with ItemStatus.Init when getting cached item in the same cycle", () => {
    const mapStore = new TestMapStore(dispatcher, requestDataSync);

    const id = "any-item-id";

    const item = mapStore.get(id);
    const item2 = mapStore.get(id);
    expect(item2).toBe(item);
});

it("should have defined buffer after initialization", () => {
    const mapStore = new TestMapStore(dispatcher, requestDataSync);
    const buffer = mapStore.getTestRequestsBuffer();

    expect(buffer).toBeDefined();
});

it("should add non-cached item key to the buffer", () => {
    const id = "any-item-id";
    const mapStore = new TestMapStore(dispatcher, requestDataSync);

    expect(mapStore.getTestRequestsBuffer().has(id)).toBe(false);
    mapStore.get(id);
    expect(mapStore.getTestRequestsBuffer().has(id)).toBe(true);
});

it("should call requestData", async done => {
    const id = "any-item-id";
    const resolvable = new Resolvable();

    const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
        resolvable.resolve();
        return requestDataSync(ids);
    };

    const mockedRequestDataHandler = jest.fn(requestDataHandler);
    const mapStore = new TestMapStore(dispatcher, mockedRequestDataHandler);

    mapStore.get(id);
    await resolvable.promise;
    // mockedRequestDataHandler will surely be called, as resolvable is resolved only inside of it, but let's check it anyway
    expect(mockedRequestDataHandler).toBeCalled();
    done();
});

it("should set items statuses to Pending while waiting for requestData to be resolved", async done => {
    const id = "one";
    const requestDataResolvable = new Resolvable();

    const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
        // Indicate that requestData has been called
        requestDataResolvable.resolve();

        // And to let tests capture intermediate state, defer resolution indefinitely
        await new Promise(resolve => {});
        return requestDataSync(ids);
    };

    const mapStore = new TestMapStore(dispatcher, requestDataHandler);

    // Request data for an item
    mapStore.get(id);

    // Resolved only when requestDataHandler is called
    await requestDataResolvable.promise;

    let buffer = mapStore.getTestRequestsBuffer();
    expect(buffer.has(id)).toBe(true);
    let bufferItem = buffer.get(id);
    expect(bufferItem).toBeDefined();
    expect(bufferItem!.status).toBe(ItemStatus.Pending);

    done();
});

it("should set items statuses to Loaded when requestData result returns requested values for keys", async done => {
    const id = "one";
    const mapStore = new TestMapStore(dispatcher, requestDataSync);

    // Request data for an item
    mapStore.get(id);

    // Ensure that throttling only defers one async cycle later (0ms throttle)
    expect(mapStore.getTestDataFetchThrottleTime()).toBe(0);

    // Defer tests one async cycle later for request to be resolved before tests
    await new Promise(resolve => setTimeout(resolve));

    let buffer = mapStore.getTestRequestsBuffer();
    expect(buffer.has(id)).toBe(true);
    let bufferItem = buffer.get(id);
    expect(bufferItem).toBeDefined();
    expect(bufferItem!.status).toBe(ItemStatus.Loaded);
    expect(bufferItem!.value).toEqual(cache.get(id));

    done();
});

it("should set items statuses to Failed when requestData throws", async done => {
    const id = "one";
    const mapStore = new TestMapStore(dispatcher, ids => {
        throw new Error("requestData failed.");
    });

    // Request data for an item
    mapStore.get(id);

    // Ensure that throttling only defers one async cycle later (0ms throttle)
    expect(mapStore.getTestDataFetchThrottleTime()).toBe(0);

    // Defer tests one async cycle later for request to be resolved before tests
    await new Promise(resolve => setTimeout(resolve));

    let buffer = mapStore.getTestRequestsBuffer();
    expect(buffer.has(id)).toBe(true);
    let bufferItem = buffer.get(id);
    expect(bufferItem).toBeDefined();
    expect(bufferItem!.status).toBe(ItemStatus.Failed);
    expect(bufferItem!.value).not.toEqual(cache.get(id));

    done();
});
