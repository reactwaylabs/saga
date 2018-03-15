import * as Flux from "flux";
import * as Immutable from "immutable";
import { MapStore } from "../map-store";
import { ItemStatus } from "../../abstractions";
import { RequestDataHandler, RequestDataHandlerResult } from "../../contracts";
import { DispatcherClass, DispatcherMessage } from "../..";
import { RequestsBuffer } from "../../handlers/requests-buffer";
import { SynchronizeMapStoreAction } from "../../actions/actions";

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
const cache: Immutable.Map<string, TestItem> = Immutable.Map(itemsMap);

class TestMapStore extends MapStore<TestItem> {
    constructor(_dispatcher: Flux.Dispatcher<DispatcherMessage<any>>, requestDataHandler: RequestDataHandler<TestItem>) {
        super(_dispatcher);
        this.requestDataHandler = requestDataHandler;
        this.dataFetchThrottleTime = 0;
    }
    protected async requestData(ids: string[]): Promise<RequestDataHandlerResult<TestItem>> {
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
    try {
        const id = "one";
        const requestDataResolvable = new Resolvable();

        const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
            // Indicate that requestData has been called
            requestDataResolvable.resolve();

            // And to let tests capture intermediate state, defer resolution indefinitely
            // tslint:disable-next-line no-empty
            await new Promise(resolve => {});
            return requestDataSync(ids);
        };

        const mapStore = new TestMapStore(dispatcher, requestDataHandler);

        // Request data for an item
        mapStore.get(id);

        // Resolved only when requestDataHandler is called
        await requestDataResolvable.promise;

        const buffer = mapStore.getTestRequestsBuffer();
        expect(buffer.has(id)).toBe(true);
        const bufferItem = buffer.get(id);
        expect(bufferItem).toBeDefined();
        expect(bufferItem!.status).toBe(ItemStatus.Pending);
        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should set items statuses to Loaded when requestData result returns requested values for keys", async done => {
    try {
        const id = "one";
        const mapStoreSynchronizationResolvable = new Resolvable();
        const mapStore = new TestMapStore(dispatcher, requestDataSync);

        dispatcher.register(payload => {
            if (payload.action instanceof SynchronizeMapStoreAction) {
                dispatcher.waitFor([mapStore.getDispatchToken()]);
                mapStoreSynchronizationResolvable.resolve();
            }
        });

        // Request data for an item
        mapStore.get(id);

        await mapStoreSynchronizationResolvable.promise;

        const item = mapStore.get(id);
        expect(item.status).toBe(ItemStatus.Loaded);
        expect(item.value).toEqual(cache.get(id));

        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should set items statuses to Failed when requestData throws", async done => {
    try {
        const id = "one";
        const mapStoreSynchronizationResolvable = new Resolvable();
        const mapStore = new TestMapStore(dispatcher, ids => {
            throw new Error("requestData failed.");
        });

        dispatcher.register(payload => {
            if (payload.action instanceof SynchronizeMapStoreAction) {
                dispatcher.waitFor([mapStore.getDispatchToken()]);
                mapStoreSynchronizationResolvable.resolve();
            }
        });

        // Request data for an item
        mapStore.get(id);

        await mapStoreSynchronizationResolvable.promise;

        const item = mapStore.get(id);
        expect(item.status).toBe(ItemStatus.Failed);
        expect(item.value).not.toEqual(cache.get(id));
        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should set items statuses to NoData when requestData result returns null for keys", async done => {
    try {
        const anyId = "any-item-id";
        const mapStoreSynchronizationResolvable = new Resolvable();
        const mapStore = new TestMapStore(dispatcher, async ids => {
            const result: { [id: string]: null } = {};
            for (const id of ids) {
                result[id] = null;
            }
            return result;
        });

        dispatcher.register(payload => {
            if (payload.action instanceof SynchronizeMapStoreAction) {
                dispatcher.waitFor([mapStore.getDispatchToken()]);
                mapStoreSynchronizationResolvable.resolve();
            }
        });

        // Request data for an item
        mapStore.get(anyId);

        await mapStoreSynchronizationResolvable.promise;

        const item = mapStore.get(anyId);
        expect(item).toBeDefined();
        expect(item.status).toBe(ItemStatus.NoData);
        expect(item.value).not.toBeDefined();

        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should set items statuses to Loaded and NoData when requestData result returns value and null for keys", async done => {
    try {
        const existingId = "one";
        const nonExistentId = "any-item-id";

        const mapStoreSynchronizationResolvable = new Resolvable();
        const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
            const result: { [id: string]: TestItem | null } = {};
            for (const id of ids) {
                result[id] = cache.get(id) || null;
            }
            return result;
        };

        dispatcher.register(payload => {
            if (payload.action instanceof SynchronizeMapStoreAction) {
                dispatcher.waitFor([mapStore.getDispatchToken()]);
                mapStoreSynchronizationResolvable.resolve();
            }
        });

        const mapStore = new TestMapStore(dispatcher, requestDataHandler);

        // Request data for an item
        mapStore.getAll([nonExistentId, existingId]);

        await mapStoreSynchronizationResolvable.promise;

        const nonExistentItem = mapStore.get(nonExistentId);
        expect(nonExistentItem).toBeDefined();
        expect(nonExistentItem.status).toBe(ItemStatus.NoData);
        expect(nonExistentItem.value).not.toBeDefined();

        const existingItem = mapStore.get(existingId);
        expect(existingItem).toBeDefined();
        expect(existingItem.status).toBe(ItemStatus.Loaded);
        expect(existingItem.value).toEqual(cache.get(existingId));

        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should dispatch synchronization action after loading data", async done => {
    try {
        const existingId = "one";

        const requestDataResolvable = new Resolvable();

        const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
            // Indicate that requestData has been called
            requestDataResolvable.resolve();

            const result: { [id: string]: TestItem | null } = {};
            for (const id of ids) {
                result[id] = cache.get(id) || null;
            }
            return result;
        };

        const mapStore = new TestMapStore(dispatcher, requestDataHandler);
        const dispatchToken = mapStore.getDispatchToken();

        let synchronizationActionDispached = false;
        dispatcher.register(payload => {
            if (payload.action instanceof SynchronizeMapStoreAction && payload.action.storeDispatchToken === dispatchToken) {
                synchronizationActionDispached = true;
            }
        });

        // Request data for an item
        mapStore.get(existingId);

        // Wait for requestData to be called
        await requestDataResolvable.promise;

        // Ensure that throttling only defers one async cycle later (0ms throttle)
        expect(mapStore.getTestDataFetchThrottleTime()).toBe(0);

        // Defer tests one async cycle later for request to be resolved before tests
        await new Promise(resolve => setTimeout(resolve));

        expect(synchronizationActionDispached).toBe(true);

        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should reload data when requested with noCache", async done => {
    try {
        const existingId = "one";

        const requestDataResolvable1 = new Resolvable();
        const requestDataResolvable2 = new Resolvable();
        let requestDataCallCount = 0;

        const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
            requestDataCallCount++;

            if (requestDataCallCount === 1) {
                // Indicate that requestData has been called once
                requestDataResolvable1.resolve();
            }

            if (requestDataCallCount === 2) {
                // Indicate that requestData has been called twice
                requestDataResolvable2.resolve();
            }

            const result: { [id: string]: TestItem | null } = {};
            for (const id of ids) {
                result[id] = cache.get(id) || null;
            }
            return result;
        };

        const mapStore = new TestMapStore(dispatcher, requestDataHandler);

        // Request data for an item
        mapStore.get(existingId);

        // Wait for requestData to be called
        await requestDataResolvable1.promise;

        expect(requestDataCallCount).toBe(1);

        const item = mapStore.get(existingId);
        expect(item).toBeDefined();
        expect(item.status).toBe(ItemStatus.Loaded);
        expect(item.value).toBe(cache.get(existingId));

        const noCacheItem = mapStore.get(existingId, true);
        expect(noCacheItem).toBeDefined();
        expect(noCacheItem.status).toBe(ItemStatus.Init);
        expect(noCacheItem.value).not.toBeDefined();

        await requestDataResolvable2.promise;

        expect(requestDataCallCount).toBe(2);

        const noCacheItemLoaded = mapStore.get(existingId);
        expect(noCacheItemLoaded).toBeDefined();
        expect(noCacheItemLoaded.status).toBe(ItemStatus.Loaded);
        expect(noCacheItemLoaded.value).toBeDefined();
        expect(noCacheItemLoaded.value).toBe(cache.get(existingId));

        done();
    } catch (error) {
        done.fail(error);
    }
});

it("should invalidate data when invalidateCache is called", async done => {
    try {
        const existingId = "one";

        const requestDataResolvable1 = new Resolvable();
        const requestDataResolvable2 = new Resolvable();
        let requestDataCallCount = 0;

        const requestDataHandler: RequestDataHandler<TestItem> = async ids => {
            requestDataCallCount++;

            if (requestDataCallCount === 1) {
                // Indicate that requestData has been called once
                requestDataResolvable1.resolve();
            }

            if (requestDataCallCount === 2) {
                // Indicate that requestData has been called twice
                requestDataResolvable2.resolve();
            }

            const result: { [id: string]: TestItem | null } = {};
            for (const id of ids) {
                result[id] = cache.get(id) || null;
            }
            return result;
        };

        const mapStore = new TestMapStore(dispatcher, requestDataHandler);

        // Request data for an item
        mapStore.get(existingId);

        // Wait for requestData to be called
        await requestDataResolvable1.promise;

        expect(requestDataCallCount).toBe(1);

        const item = mapStore.get(existingId);
        expect(item).toBeDefined();
        expect(item.status).toBe(ItemStatus.Loaded);
        expect(item.value).toBe(cache.get(existingId));

        mapStore.invalidateCache(existingId);

        const invalidatedItem = mapStore.get(existingId);
        expect(invalidatedItem).toBeDefined();
        expect(invalidatedItem.status).toBe(ItemStatus.Init);
        expect(invalidatedItem.value).not.toBeDefined();

        await requestDataResolvable2.promise;

        expect(requestDataCallCount).toBe(2);

        const invalidatedItemLoaded = mapStore.get(existingId);
        expect(invalidatedItemLoaded).toBeDefined();
        expect(invalidatedItemLoaded.status).toBe(ItemStatus.Loaded);
        expect(invalidatedItemLoaded.value).toBeDefined();
        expect(invalidatedItemLoaded.value).toBe(cache.get(existingId));

        done();
    } catch (error) {
        done.fail(error);
    }
});
