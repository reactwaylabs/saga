export function generateRandomString(): string {
    return Math.random()
        .toString(36)
        .substring(2);
}

export function instanceOfClass(obj: object): boolean {
    return obj.constructor instanceof Function;
}
