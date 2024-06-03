
import { IStruct, RawStruct, RefStruct } from "../model/struct";
import { Stats } from "../model/stats";

/**
 * Traverses the nested values of a series of objects.
 * The big inheritance chain is just for splitting the base implementation into multiple files
 */
export abstract class BaseScanner_0 {
    /**
     * Traverses a value of an unknown type
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    scan(value: unknown, stats: Stats): IStruct {
        if (value === null) return new RawStruct("null");
        if (value === globalThis) return new RawStruct("globalThis");
        if (Object.is(value, -0)) return new RawStruct("-0");
        switch (typeof value) {
            case "function": return this.scanFunction(value, stats);
            case "object": return this.scanObject(value, stats);
            case "symbol": return this.scanSymbol(value, stats);            
            case "string": return this.scanString(value, stats);
            case "bigint": return new RawStruct(`${value}n`);
            default: return new RawStruct(`${value}`);
        }
    }

    /**
     * Handles values that need to be serialized by reference
     * @param value The value for which to cache the reference
     * @param stats The state of the current serialization
     * @param f Function that will generate the structure of {@link value} if it has not already been generated
     */
    scanRef<T>(value: T, stats: Stats, f: (x: T) => IStruct): IStruct {
        var ref = stats.cache.get(value);
        if (!ref) stats.cache.set(value, ref = new RefStruct()), ref.struct = f(value); // The reference must be cached BEFORE traversing the value, otherwise circular references could generate a stack overflow
        else if (ref.id === undefined) ref.id = null;
        return ref;
    }

    /**
     * Traverses a function
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    abstract scanFunction(value: Function, stats: Stats): IStruct;

    /**
     * Traverses an object
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    abstract scanObject(value: object, stats: Stats): IStruct;

    /**
     * Traverses a symbol
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    abstract scanSymbol(value: symbol, stats: Stats): IStruct;

    /**
     * Traverses a string
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    abstract scanString(value: string, stats: Stats): IStruct;
}