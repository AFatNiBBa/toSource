
import { CodeWriter } from "../writer";
import { Stats } from "./opts";

/** An {@link IStruct} that handles multiple references to a value in the same main structure */
export class RefStruct extends Array<IStruct> implements IStruct {
    id: number | null | undefined;
    struct: IStruct | undefined;
    done = false;

    getRef() { return this; }

    writeTo(writer: CodeWriter, stats: Stats, safe: boolean) {
        var { id } = this;
        if (id === undefined) return this.struct!.writeTo(writer, stats, safe); // If there's no id it means that there's only one reference
        if (id !== null) return writer.write(`${stats.opts.var}[${id}]`);       // If there's a number it means that the actual value has already been stringified
        id = this.id = stats.id++;                                              // If there's a `null` it means that the actual value must be stringified and registered in the deserialization cache because there're multiple references to it
        const circ = [ ...this.filterDeferred() ];
        if (circ.length)
            writer.write("("),
            writer.enter(),
            writer.endl();
        else if (!safe)
            writer.write("(");
        writer.write(`${stats.opts.var}[${id}]`, "=", "");
        this.struct!.writeTo(writer, stats, true);
        if (!circ.length) return !safe && writer.write(")");
        for (const elm of circ)
            writer.write(","),
            writer.endl(),
            elm.writeTo(writer, stats, true);
        writer.exit();
        writer.endl();
        writer.write(")");
    }

    /**
     * Yields the elements of {@link deferred} that can be emitted.
     * If the value returned by the last element is not the same referenced by the current object, this reference gets emitted again
     */
    *filterDeferred(): Generator<IStruct> {
        if (!this.length)
            return;
        for (var elm of this)
            yield elm;
        if (this !== elm!.getRef())
            yield this;
    }
}

/** An {@link IStruct} containing raw code */
export class RawStruct implements IStruct {
    constructor(public value: string) { }

    getRef() { return undefined; }

    writeTo(writer: CodeWriter) { writer.write(this.value); }
}

/**
 * Type that represents the structure of a serializable object.
 * They're meant to temporarily store informations about the traversing of objects before their stringification.
 * They're not meant to be stringified more than once
 */
export interface IStruct {
    /**
     * Returns the reference of the current object.
     * If there isn't any, ot it's not known at this level it returns `undefined`
     */
    getRef(): RefStruct | undefined;

    /**
     * Stringifies the represented structure into {@link writer}
     * @param writer The output stream
     * @param stats The state of the current serialization
     * @param safe A value that tells whether the result will be inserted in a place in which it would be ambiguous without parenthesis
     */
    writeTo(writer: CodeWriter, stats: Stats, safe: boolean): void;
}