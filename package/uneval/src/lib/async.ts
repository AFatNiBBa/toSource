
import "@seanalunni/explicit-resource-management-polyfill";

/**
 * The return type of wrapped async functions.
 * You can yield {@link PromiseLike}s and the top function will await them eventually or throw if it can't
 */
export type AwaitIterator<T> = Generator<PromiseLike<unknown>, T, unknown>;

/**
 * Creates a {@link AwaitIterator} that returns the awaited version of {@link value}
 * @param value The value to await
 */
export function *wrap<T>(value: T): AwaitIterator<Awaited<T>> {
    var out!: Awaited<T>;
    yield Promise.resolve(value).then(x => out = x);
    return out;
}

/**
 * Runs an {@link AwaitIterator} synchronously.
 * @throws {AsyncError} Throws an error at each await that it's tried to be made
 * @param iter The iterator that handles the operation
 * @returns The same thing {@link iter} returned
 */
export function callSync<T>(iter: AwaitIterator<T>): T {
    using _ = iter;
    const { value, done } = iter.next();
    if (done) return value;
    throw new AsyncError(value);
}

/**
 * Runs an {@link AwaitIterator} asynchronously
 * @param iter The iterator that handles the operation
 * @returns The same thing {@link iter} returned
 */
export async function callAsync<T>(iter: AwaitIterator<T>): Promise<T> {
    using _ = iter;
    for (var next: unknown; true; ) {
        const { value, done } = iter.next(next);
        if (done) return value;
        next = await value;
    }
}

/**
 * Error that gets thrown when trying to await a promise when using {@link callSync}.
 * The promise that was trying to be awaited will be stored in {@link AsyncError.cause}
 */
export class AsyncError extends Error {
    constructor(cause: PromiseLike<unknown>) { super("There has been an attempt to await a value inside of a function that was called synchronously", { cause }); }
}