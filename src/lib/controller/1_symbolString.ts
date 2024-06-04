
import { IStruct, RawStruct } from "../model/struct";
import { KeyStruct } from "../model/prop";
import { AwaitIterator } from "../async";
import { BaseScanner_0 } from "./0_base";
import { CodeWriter } from "../writer";
import { Stats } from "../model/opts";

/** Expression that checks if a string follows the pattern of the description of a built-in global symbol */
const REGEX_GLOBAL_SYMBOL = /(?<=^Symbol\.)\w+$/;

/** Scanner that handles strings and symbols */
export abstract class SymbolStringScanner_1 extends BaseScanner_0 {
    *scanSymbol(value: symbol, stats: Stats): AwaitIterator<IStruct> {
        const { description } = value;
        var match: RegExpMatchArray | null;
        return description != null && (match = description.match(REGEX_GLOBAL_SYMBOL)) && Symbol[match[0] as keyof typeof Symbol] === value
            ? new RawStruct(description)
            : yield* this.scanRef(value, stats, () => this.scanSymbolInner(value, stats));
    }

    /**
     * Traverses a symbol without checking for multiple references
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    *scanSymbolInner(value: symbol, stats: Stats): AwaitIterator<IStruct> {
        const key = Symbol.keyFor(value);
        return key == null
            ? value.description == null
                ? new RawStruct("Symbol()")
                : new SymbolStruct(yield* this.scanString(value.description, stats), false)
            : new SymbolStruct(yield* this.scanString(key, stats), true);
    }
    
    scanString(value: string, stats: Stats): AwaitIterator<IStruct> {
        return value.length > stats.opts.strRepeatMaxLength
            ? this.scanRef(value, stats, () => this.scanStringInner(value, stats))
            : this.scanStringInner(value, stats);
    }

    /**
     * Traverses a string without checking for multiple references
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    *scanStringInner(value: string, _: Stats): AwaitIterator<IStruct> {
        return new RawStruct(JSON.stringify(value));
    }

    /**
     * Traverses a string OR a symbol in the specific context of defining a property accessor
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    *scanKey(value: string | symbol, stats: Stats): AwaitIterator<IStruct> {
        const key = typeof value !== "string" || stats.opts.strRepeatMaxLengthOnKeys && value.length > stats.opts.strRepeatMaxLength
            ? yield* this.scan(value, stats)
            : value;
        return new KeyStruct(key);
    }
}

/** An {@link IStruct} that handles symbols with a description */
export class SymbolStruct implements IStruct {
    constructor(public key: IStruct, public registry: boolean) { }
    
    getRef() { return undefined; }

    writeTo(writer: CodeWriter, stats: Stats) {
        writer.write(this.registry ? "Symbol.for(" : "Symbol(");
        this.key.writeTo(writer, stats, true);
        writer.write(")");
    }
}