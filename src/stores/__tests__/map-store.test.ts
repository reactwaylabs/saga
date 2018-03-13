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
    const mapStore = new TestMapStore(dispatcher, requestDataSync);

    const id = "any-item-id";

    expect(mapStore.getTestRequestsBuffer().has(id)).toBe(false);
    mapStore.get(id);
    expect(mapStore.getTestRequestsBuffer().has(id)).toBe(true);
});

it("should call requestData", async done => {
    const resolvable = new Resolvable();

    const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
        resolvable.resolve();
        return requestDataSync(ids);
    };

    const mockedRequestDataHandler = jest.fn(requestDataHandler);
    const mapStore = new TestMapStore(dispatcher, mockedRequestDataHandler);

    const id = "any-item-id";

    mapStore.get(id);
    await resolvable.promise;
    // mockedRequestDataHandler will surely be called, as resolvable is resolved only inside of it, but let's check it anyway
    expect(mockedRequestDataHandler).toBeCalled();
    done();
});

it("should set items statuses to Pending while waiting for requestData result", async done => {
    const requestDataResolvable = new Resolvable();
    const testsResolvable = new Resolvable();

    const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
        // Indicate that requestData has been called
        requestDataResolvable.resolve();

        // Wait for tests to run
        await testsResolvable.promise;
        return requestDataSync(ids);
    };

    const mockedRequestDataHandler = jest.fn(requestDataHandler);
    const mapStore = new TestMapStore(dispatcher, mockedRequestDataHandler);

    const id = "one";

    // Request data for an item
    debugger;
    mapStore.get(id);

    // Wait until requestData will be called
    await requestDataResolvable.promise;

    const buffer = mapStore.getTestRequestsBuffer();
    console.log((buffer as any).items);
    expect(buffer.has(id)).toBe(true);
    const bufferItem = buffer.get(id);
    expect(bufferItem).toBeDefined();
    expect(bufferItem!.status).toBe(ItemStatus.Pending);

    // mockedRequestDataHandler will surely be called, as resolvable is resolved only inside of it, but let's check it anyway
    expect(mockedRequestDataHandler).toBeCalled();
    done();
});
