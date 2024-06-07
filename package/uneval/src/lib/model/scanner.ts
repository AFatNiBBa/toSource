
import { FunctionScanner_6 } from "../controller/6_function";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { IStruct } from "./struct";
import { Stats } from "./opts";

/**
 * Type of a plugin function.
 * It's a mixin that takes the previous plugin and extends it
 */
export type Plugin = (x: typeof Scanner) => typeof Scanner;

/**
 * Final stage of the built-in scanner.
 * Can be extended through the {@link Scanner.plugin} method (Or manually)
 */
export class Scanner extends FunctionScanner_6 {
    /**
     * Applies a series of plugins to the current class.
     * Can be called on the result too
     * @param list The list of {@link Plugin} to apply
     */
    static plugin(...list: Plugin[]) {
        return list.reduce((x, f) => f(x), this);
    }

    /**
     * Traverses a value of an unknown type and does necessary top level checks
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    *scanTop(value: unknown, stats: Stats): AwaitIterator<IStruct> {
        return new TopStruct(yield* this.scan(value, stats));
    }
}

/** An {@link IStruct} that handles the top level object of a serialization */
export class TopStruct implements IStruct {
    constructor(public struct: IStruct) { }

    getRef() { return undefined; }

    writeTo(writer: CodeWriter, stats: Stats, safe: boolean): void {
        const { opts, duplicates, opts: { factory } } = stats, func = duplicates || factory, wrap = factory ? !safe : duplicates;
        if (wrap) writer.write("(");
        if (duplicates) writer.write(`(${opts.var}`, "=", "{})", "=>", "");
        else if (factory) writer.write("()", "=>", "");
        this.struct.writeTo(writer, stats, !func && safe);
        if (wrap) writer.write(")");
        if (func && !factory) writer.write("()");
    }
}