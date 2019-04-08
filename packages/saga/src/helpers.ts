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

export function getNameOfObject(obj: object): string {
    return (obj.constructor as any).name;
}
