
import { IStruct, RefStruct } from "./struct";
import { CodeWriter } from "../writer";
import { Stats } from "./opts";

/** Expression that checks if a string is a valid JavaScript variable name */
const REGEX_VARIABLE_NAME = /^[\p{L}_$][\p{L}\p{N}_$]*$/u;

/** An {@link IStruct} that represents an access to an object property */
export class KeyStruct implements IStruct {
    constructor(public key: IStruct | string) { }

    getRef() { return this.struct?.getRef(); }

    getDefer() { return this.struct?.getDefer(); }

    /**
     * Handles a property access in the most idiomatic way possible.
     * If {@link key} is NOT a string, the indexer syntax (`[?]`) will be used regardless.
     * If the string is a valid JavaScript variable name, it will be used as is (`?`) or with a dot in front (`.?`) if {@link obj} is `false`.
     * If the string is not a valid JavaScript variable name, it will be stringified before being used (`"?"`) and wrapped too (`["?"]`) if {@link obj} is `false`
     * @param writer The output stream
     * @param stats The state of the current serialization
     * @param obj A value that tells whether the current property access is a property initialization inside an object literal
     */
    writeTo(writer: CodeWriter, stats: Stats, obj: boolean): void {
        const { key } = this;

        if (typeof key !== "string")
            return writer.write("["), key.writeTo(writer, stats, true), writer.write("]");

        if (key.match(REGEX_VARIABLE_NAME))
            return !obj && writer.write("."), writer.write(key);

        const temp = JSON.stringify(key);
        if (!obj) writer.write("[");
        writer.write(temp);
        if (!obj) writer.write("]");
    }

    /** Returns {@link key}, but ONLY if it's a struct */
    get struct() {
        const { key } = this;
        return typeof key === "string"
            ? undefined
            : key;
    }
}

/** An {@link IStruct} that handles a proterty assignment */
export class PropStruct implements IStruct {
    constructor(public key: IStruct, public value: IStruct) { }

    getRef() { return this.value.getRef() }

    getDefer() { return RefStruct.circ(this.key, this.value); }

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

/** An {@link IStruct} that handles a circular reference */
export class PropDefer implements IStruct {
    constructor(public obj: RefStruct, public prop: PropStruct) { }

    getRef() { return this.prop.getRef(); }

    getDefer() { return this.prop.getDefer(); }

    writeTo(writer: CodeWriter, stats: Stats): void {
        this.obj.writeTo(writer, stats, true);
        this.prop.writeTo(writer, stats, false);
    }
}