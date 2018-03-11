import * as Flux from "flux";
import * as Immutable from "immutable";
import { MapStore } from "../map-store";
import { ItemStatus } from "../../abstractions";
import { OnSuccess, OnFailure } from "../../contracts";
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

type RequestDataHandler = (ids: string[], onSuccess: OnSuccess<TestItem>, onFailed: OnFailure) => void;

class TestMapStore extends MapStore<TestItem> {
    constructor(dispatcher?: Flux.Dispatcher<DispatcherMessage<any>>) {
        super(dispatcher);
    }

    private requestDataHandler: RequestDataHandler;

    protected requestData(ids: string[], onSuccess: OnSuccess<TestItem>, onFailed: OnFailure): void {
        if (this.requestDataHandler == null) {
            throw new Error(`requestDataHandler was not set before TestMapStore usage.`);
        }

        this.requestDataHandler(ids, onSuccess, onFailed);
    }

    public getRequestsBuffer(): RequestsBuffer<TestItem> {
        return this.requestsBuffer;
    }

    public setRequestDataHandler(requestDataHandler: RequestDataHandler): void {
        this.requestDataHandler = requestDataHandler;
    }
}

let dispatcher: DispatcherClass;
let requestDataHandler: RequestDataHandler = (ids, onSuccess, onFailed) => {
    const results: { [id: string]: TestItem } = {};
    for (const id of ids) {
        const result = cache.get(id);
        if (result != null) {
            results[id] = result;
        }
    }

    onSuccess(Immutable.Map(results));
};

beforeEach(() => {
    dispatcher = new DispatcherClass();
});

it("should throw if state is being accessed directly from the store", () => {
    const mapStore = new TestMapStore(dispatcher);
    expect(mapStore.getState).toThrow();
});

it("should return sythetic item with ItemStatus.Init when getting non-cached item", () => {
    const mapStore = new TestMapStore(dispatcher);
    mapStore.setRequestDataHandler(requestDataHandler);

    const item = mapStore.get("any-item-id");
    expect(item).toBeDefined();
    expect(item.status).toBe(ItemStatus.Init);
});

it("should return the same sythetic item with ItemStatus.Init when getting cached item in the same cycle", () => {
    const mapStore = new TestMapStore(dispatcher);
    mapStore.setRequestDataHandler(requestDataHandler);

    const id = "any-item-id";

    const item = mapStore.get(id);
    const item2 = mapStore.get(id);
    expect(item2).toBe(item);
});

it("should have defined buffer after initialization", () => {
    const mapStore = new TestMapStore(dispatcher);
    const buffer = mapStore.getRequestsBuffer();

    expect(buffer).toBeDefined();
});

it("should add non-cached item key to the buffer", () => {
    const mapStore = new TestMapStore(dispatcher);
    mapStore.setRequestDataHandler(requestDataHandler);

    const id = "any-item-id";

    expect(mapStore.getRequestsBuffer().has(id)).toBe(false);
    mapStore.get(id);
    expect(mapStore.getRequestsBuffer().has(id)).toBe(true);
});

it("should call requestData", () => {
    const mapStore = new TestMapStore(dispatcher);
    const mockedRequestDataHandler = jest.fn(requestDataHandler);
    mapStore.setRequestDataHandler(mockedRequestDataHandler);

    const id = "any-item-id";

    mapStore.get(id);
    expect(mockedRequestDataHandler).toBeCalled();
});
