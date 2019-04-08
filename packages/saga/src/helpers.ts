import { AnyObject } from "./contracts";

export function generateRandomString(): string {
    return Math.random()
        .toString(36)
        .substring(2);
}

export function instanceOfClass(obj: object): boolean {
    let current = obj.constructor;

    while (true) {
        if (current === Function) {
            return true;
        }
        if (current === Object) {
            return false;
        }
        current = current.constructor;
    }
}

export function isObject(obj: unknown): obj is AnyObject {
    return typeof obj === "object" && obj != null;
}

export function getNameOfObject(obj: object): string {
    // tslint:disable-next-line:no-any
    return (obj.constructor as any).name;
}
