
import { IStruct, RawStruct, RefStruct } from "../model/struct";
import { SymbolStringScanner_1 } from "./1_symbolString";
import { PropDefer, PropStruct } from "../model/prop";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { Stats } from "../model/opts";

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
        const { constructor } = value;
        return typeof constructor === "function" && constructor.prototype === value
                ? yield* this.scanProto(value, constructor, stats)
            : Array.isArray(value)
                ? yield* this.scanObjectProto(value, Array.prototype, stats, ref, yield* this.scanArray(value, stats, ref))
            : value instanceof Date
                ? yield* this.scanObjectProto(value, Date.prototype, stats, ref, new RawStruct(`new Date(${+value})`))
            : value instanceof RegExp
                ? yield* this.scanObjectProto(value, RegExp.prototype, stats, ref, new RawStruct(value.toString()))
            : value instanceof String
                ? yield* this.scanObjectProto(value, String.prototype, stats, ref, yield* this.scanObjectWrapper(value, stats))
            : value instanceof Boolean
                ? yield* this.scanObjectProto(value, Boolean.prototype, stats, ref, yield* this.scanObjectWrapper(value, stats))
            : value instanceof Number
                ? yield* this.scanObjectProto(value, Number.prototype, stats, ref, yield* this.scanObjectWrapper(value, stats))
            : value instanceof BigInt
                ? yield* this.scanObjectProto(value, BigInt.prototype, stats, ref, yield* this.scanObjectWrapper(value, stats))
            : value instanceof Symbol
                ? yield* this.scanObjectProto(value, Symbol.prototype, stats, ref, yield* this.scanObjectWrapper(value, stats))
                : yield* this.scanObjectProto(value, Object.prototype, stats, ref, yield* this.scanObjectLiteral(value, stats, ref));
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
        if (++stats.depth <= stats.opts.depth) {
            for (const elm of Reflect.ownKeys(value)) {
                const prop = new PropStruct(yield* this.scanKey(elm, stats), yield* this.scan(value[elm as keyof typeof value], stats));
                const defer = prop.getDefer();
                if (defer) defer.push(new PropDefer(ref, prop));
                else items.push(prop);
            }
        }
        stats.depth--;
        return new ObjectStruct(items);
    }

    /**
     * Traverses an array
     * @param value The value to traverse
     * @param stats The state of the current serialization
     * @param ref The reference to the current value
     */
    abstract scanArray(value: Array<unknown>, stats: Stats, ref: RefStruct): AwaitIterator<IStruct>;

    /**
     * Traverses the prototype of an object
     * @param value The value to traverse
     * @param expected The expected prototype of {@link value}
     * @param stats The state of the current serialization
     * @param ref The reference to the current value
     * @param struct The structure of {@link value}
     */
    abstract scanObjectProto(value: object, expected: object, stats: Stats, ref: RefStruct, struct: IStruct): AwaitIterator<IStruct>;

    /**
     * Traverses an object which IS a prototype
     * @param value The value to traverse
     * @param ctor The function to which the prototype belongs
     * @param stats The state of the current serialization
     */
    abstract scanProto(value: object, ctor: Function, stats: Stats): AwaitIterator<IStruct>;
}

/** An {@link IStruct} that handles an object wrapper for a native value */
export class WrapperStruct implements IStruct {
    constructor(public struct: IStruct) { }

    getRef() { return undefined; }

    getDefer() { return this.struct.getDefer(); }

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

    getDefer() { return undefined; }
    
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