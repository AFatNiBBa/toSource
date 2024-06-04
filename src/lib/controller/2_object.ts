
import { SymbolStringScanner_1 } from "./1_symbolString";
import { IStruct, RawStruct, RefStruct } from "../model/struct";
import { PropDefer, PropStruct } from "../model/prop";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { Stats } from "../model/stats";

/** Scanner that handles objects */
export abstract class ObjectScanner_2 extends SymbolStringScanner_1 {
    scanObject(value: object, stats: Stats): AwaitIterator<IStruct> {
        return this.scanRef(value, stats, x => this.scanObjectInner(value, stats, x));
    }

    /**
     * Traverses an object without checking for multiple references
     * @param value The value to traverse
     * @param stats The state of the current serialization
     * @param ref The reference to the current value
     */
    *scanObjectInner(value: object, stats: Stats, ref: RefStruct): AwaitIterator<IStruct> {
        return Array.isArray(value)
            ? yield* this.scanArray(value, stats, ref)
            : value instanceof Date
                ? new RawStruct(`new Date(${+value})`)
                : value instanceof RegExp
                    ? new RawStruct(value.toString())
                    : value instanceof String || value instanceof Boolean || value instanceof Number || value instanceof BigInt || value instanceof Symbol
                        ? yield* this.scanObjectWrapper(value, stats)
                        : yield* this.scanObjectLiteral(value, stats, ref);
    }

    /**
     * Traverses an object wrapper for a native value
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    *scanObjectWrapper(value: object, stats: Stats): AwaitIterator<IStruct> {
        return new WrapperStruct(yield* this.scan(value.valueOf(), stats));
    }

    /**
     * Traverses an object literal
     * @param value The value to traverse
     * @param stats The state of the current serialization
     * @param ref The reference to the current value
     */
    *scanObjectLiteral(value: object, stats: Stats, ref: RefStruct): AwaitIterator<IStruct> {
        const items: IStruct[] = [];
        for (const elm of Reflect.ownKeys(value)) {
            const k = yield* this.scanKey(elm, stats);
            const v = yield* this.scan(value[elm as keyof typeof value], stats);
            if (PropDefer.check(v, ref, () => k))
                items.push(new PropStruct(k, v));
        }
        return new ObjectStruct(items);
    }

    /**
     * Traverses an array
     * @param value The value to traverse
     * @param stats The state of the current serialization
     * @param ref The reference to the current value
     */
    abstract scanArray(value: Array<unknown>, stats: Stats, ref: RefStruct): AwaitIterator<IStruct>;
}

/** An {@link IStruct} that handles an object wrapper for a native value */
export class WrapperStruct implements IStruct {
    constructor(public struct: IStruct) { }

    getRef() { return undefined; }

    writeTo(writer: CodeWriter, stats: Stats): void {
        writer.write("Object(");
        this.struct.writeTo(writer, stats, true);
        writer.write(")");
    }
}

/** An {@link IStruct} that handles object literals */
export class ObjectStruct implements IStruct {
    constructor(public items: IStruct[]) { }

    getRef() { return undefined; }
    
    writeTo(writer: CodeWriter, stats: Stats, safe: boolean) {
        if (!safe) writer.write("(");
        writer.write("{");
        const { items } = this, { length } = items;
        if (length > 0) {
            writer.enter();
            for (var i = 0; i < length; i++) {
                writer.endl();
                items[i].writeTo(writer, stats, true);
                if (i < length - 1) writer.write(",");
            }
            writer.exit();
            writer.endl();
        }
        writer.write("}");
        if (!safe) writer.write(")");
    }
}