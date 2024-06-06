
import { RefStruct } from "./struct";
import { Scanner } from "./scanner";

/** Object that represents the state of the current serialization */
export class Stats {
    cache = new Map<unknown, RefStruct>();
    duplicates = false;
    depth = 0;
    id = 0;

    constructor(public opts: IOpts) { }

    /**
     * Handles an optional formatting option of {@link IUserOpts}
     * @param value The value for the option
     * @param def The default value for the option
     */
    static normalizeOptStr(value: boolean | string | undefined, def: string) {
        return typeof value === "boolean" ? value ? def : "" : value ?? def;
    }

    /**
     * Handles a repeatable optional formatting option of {@link IUserOpts}
     * @param value The value for the option
     * @param def The default value for the option
     * @param rep The value to be repeated if {@link value} is a number
     */
    static normalizeOptNumStr(value: boolean | number | string | undefined, def: string, rep: string) {
        return typeof value === "number" ? rep.repeat(value) : this.normalizeOptStr(value, def);
    }

    /**
     * Creates an {@link IOpts} processing {@link opts}
     * @param opts The {@link IUserOpts} to normalize
     */
    static normalize(opts: IUserOpts = {}) {
        const out: Partial<IOpts> = {};
        out.scanner = opts.scanner ?? Scanner.prototype;
        out.strRepeatMaxLengthOnKeys = opts.strRepeatMaxLengthOnKeys ?? false;
        out.strRepeatMaxLength = opts.strRepeatMaxLength ?? Infinity;
        out.depth = opts.depth ?? Infinity;
        out.factory = opts.factory ?? false;
        out.safe = opts.safe ?? true;
        out.var = opts.var ?? "x";

        if (opts.pretty ?? true)
            out.endl = this.normalizeOptStr(opts.endl, "\n"),
            out.tab = this.normalizeOptNumStr(opts.tab, "\t", out.space = this.normalizeOptStr(opts.space, " "));
        else
            out.space = out.endl = out.tab = "";
        
        return <IOpts>out;
    }
}

/**
 * More permissive version of {@link IOpts}.
 * Can be passed to {@link normalize} to create an {@link IOpts}
 */
export interface IUserOpts extends Partial<IActualOpts> {
    pretty?: boolean;
    space?: boolean | string;
    endl?: boolean | string;
    tab?: boolean | number | string;
}

/** Formatting options and {@link IActualOpts} */
export interface IOpts extends IActualOpts {
    space: string;
    endl: string;
    tab: string;
}

/** Serialization options */
interface IActualOpts {
    scanner: Scanner;

    strRepeatMaxLengthOnKeys: boolean;
    strRepeatMaxLength: number;
    depth: number;

    factory: boolean;
    safe: boolean;
    var: string;
}