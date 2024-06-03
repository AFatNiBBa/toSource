
import { SymbolStringScanner_1 } from "./1_symbolString";
import { IStruct, RawStruct } from "../model/struct";
import { CodeWriter } from "../writer";
import { Stats } from "../model/stats";

/** Scanner that handles objects */
export abstract class ObjectScanner_2 extends SymbolStringScanner_1 {
    scanObject(value: object, stats: Stats): IStruct {
        return this.scanRef(value, stats, () => this.scanObjectInner(value, stats));
    }

    /**
     * Traverses an object without checking for multiple references
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    scanObjectInner(value: object, stats: Stats): IStruct {
        return Array.isArray(value)
            ? this.scanArray(value, stats)
            : value instanceof Date
                ? new RawStruct(`new Date(${+value})`)
                : value instanceof RegExp
                    ? new RawStruct(value.toString())
                    : value instanceof String || value instanceof Boolean || value instanceof Number || value instanceof BigInt || value instanceof Symbol
                        ? this.scanObjectWrapper(value, stats)
                        : this.scanObjectLiteral(value, stats);
    }

    /**
     * Traverses an object wrapper for a native value
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    scanObjectWrapper(value: object, stats: Stats) {
        return new WrapperStruct(this.scan(value.valueOf(), stats));
    }

    /**
     * Traverses an object literal
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    scanObjectLiteral(value: object, stats: Stats) {
        return new ObjectStruct(Reflect
            .ownKeys(value)
            .map(x => new PropStruct(this.scanKey(x, stats), this.scan(value[x as keyof typeof value], stats))));
    }

    /**
     * Traverses an array
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    abstract scanArray(value: Array<unknown>, stats: Stats): IStruct;
}

/** An {@link IStruct} that handles an object wrapper for a native value */
export class WrapperStruct implements IStruct {
    constructor(public struct: IStruct) { }

    writeTo(writer: CodeWriter, stats: Stats): void {
        writer.write("Object(");
        this.struct.writeTo(writer, stats, true);
        writer.write(")");
    }
}

/** An {@link IStruct} that handles object literals */
export class ObjectStruct implements IStruct {
    constructor(public items: IStruct[]) { }
    
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

/** An {@link IStruct} that handles a proterty assignment */
export class PropStruct implements IStruct {
    constructor(public key: IStruct, public value: IStruct) { }

    /**
     * Handles a property assignment in the most idiomatic way possible
     * @param writer The output stream
     * @param stats The state of the current serialization
     * @param obj A value that tells whether the current property assignment is a property initialization inside an object literal
     */
    writeTo(writer: CodeWriter, stats: Stats, obj: boolean): void {
        this.key.writeTo(writer, stats, obj);
        if (obj) writer.write(":", "");
        else writer.write("", "=", "");
        this.value.writeTo(writer, stats, true);
    }
}