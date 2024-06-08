
import { CodeWriter } from "../writer";
import { Stats } from "./opts";

/** An {@link IStruct} that handles multiple references to a value in the same main structure */
export class RefStruct implements IStruct {
    private deferred: IStruct[] | undefined;
    private circSelf = true;

    id: number | null | undefined;
    struct: IStruct | undefined;
    done = false;

    constructor(public depth: number) { }

    getRef() { return this; }

    getDefer() { return this.done ? this.struct?.getDefer() : this; }

    writeTo(writer: CodeWriter, stats: Stats, safe: boolean) {
        var { id } = this;
        if (id === undefined) return this.struct!.writeTo(writer, stats, safe); // If there's no id it means that there's only one reference
        if (id !== null) return writer.write(`${stats.opts.var}[${id}]`);       // If there's a number it means that the actual value has already been stringified
        id = this.id = stats.id++;                                              // If there's a `null` it means that the actual value must be stringified and registered in the deserialization cache because there're multiple references to it
        if (this.deferred)
            writer.write("("),
            writer.enter(),
            writer.endl();
        else if (!safe)
            writer.write("(");
        const tag = `${stats.opts.var}[${id}]`;
        writer.write(tag, "=", "");
        this.struct!.writeTo(writer, stats, true);
        if (!this.deferred)
            return !safe && writer.write(")");
        for (var elm of this.deferred)
            writer.write(","),
            writer.endl(),
            elm.writeTo(writer, stats, true);
        if (!this.circSelf)
            writer.write(","),
            writer.endl(),
            writer.write(tag);
        writer.exit();
        writer.endl();
        writer.write(")");
    }

    /**
     * Adds a new deferred operation to the current reference
     * @param struct The new operation
     */
    push(struct: IStruct) {
        var { deferred } = this;
        if (!deferred) deferred = this.deferred = [];
        if (this === struct.getRef())
            deferred.push(struct),
            this.circSelf = true;
        else if (deferred.unshift(struct) === 1) // If the new element is not the only one it doesn't affect `this.circSelf`
            this.circSelf = false;
    }

    /**
     * Checks if a sequence of {@link IStruct} contains a circular reference
     * @param items The sequence in which to search
     * @returns The topmost of the eventual circular references
     */
    static circ(...items: IStruct[]) {
        var out: RefStruct | undefined, temp: RefStruct | undefined;
        for (const elm of items)
            if ((temp = elm.getDefer()) && !temp.done && (!out || temp.depth < out.depth))
                out = temp;
        return out;
    }
}

/** An {@link IStruct} containing raw code */
export class RawStruct implements IStruct {
    constructor(public value: string) { }

    getRef() { return undefined; }

    getDefer() { return undefined; }

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
     * If there isn't any, or it's not known at this level it returns `undefined`
     */
    getRef(): RefStruct | undefined;

    /**
     * Returns the eventual circular reference that this object depends on.
     * If there are more than one, the one with the smallest {@link RefStruct.depth} must be used
     */
    getDefer(): RefStruct | undefined;

    /**
     * Stringifies the represented structure into {@link writer}
     * @param writer The output stream
     * @param stats The state of the current serialization
     * @param safe A value that tells whether the result will be inserted in a place in which it would be ambiguous without parenthesis
     */
    writeTo(writer: CodeWriter, stats: Stats, safe: boolean): void;
}