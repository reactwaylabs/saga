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
