
import { CodeWriter } from "../writer";
import { Stats } from "./stats";

/** Expression that checks if a string is a valid JavaScript variable name */
const REGEX_VARIABLE_NAME = /^[\p{L}_$][\p{L}\p{N}_$]*$/u;

/** An {@link IStruct} that represents an access to an object property */
export class KeyStruct implements IStruct {
    constructor(public key: IStruct | string) { }

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
}

/** An {@link IStruct} that handles multiple references to a value in the same main structure */
export class RefStruct implements IStruct {
    struct: IStruct | undefined;
    id: number | null | undefined;

    writeTo(writer: CodeWriter, stats: Stats, safe: boolean) {
        var { id } = this;
        if (id === undefined) return this.struct!.writeTo(writer, stats, safe); // If there's no id it means that there's only one reference
        if (id !== null) return writer.write(`${stats.opts.var}[${id}]`);       // If there's a number it means that the actual value has already been stringified
        id = this.id = stats.id++;                                              // If there's a `null` it means that the actual value must be stringified and registered in the deserialization cache because there're multiple references to it
        writer.write(`${stats.opts.var}[${id}]`, "=", "");
        this.struct!.writeTo(writer, stats, true);
    }
}

/** An {@link IStruct} containing raw code */
export class RawStruct implements IStruct {
    constructor(public value: string) { }

    writeTo(writer: CodeWriter) { writer.write(this.value); }
}

/**
 * Type that represents the structure of a serializable object.
 * They're meant to temporarily store informations about the traversing of objects before their stringification.
 * They're not meant to be stringified more than once
 */
export interface IStruct {
    /**
     * Stringifies the represented structure into {@link writer}
     * @param writer The output stream
     * @param stats The state of the current serialization
     * @param safe A value that tells whether the result will be inserted in a place in which it would be ambiguous without parenthesis
     */
    writeTo(writer: CodeWriter, stats: Stats, safe: boolean): void;
}