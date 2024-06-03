
/** Handles a formatting option of {@link IUserOpts} */
const normalizeString = (x: string | boolean | undefined, def: string) => typeof x === "boolean" ? x ? def : "" : x ?? def;

/**
 * Creates an {@link IOpts} processing {@link opts}
 * @param opts The {@link IUserOpts} to normalize
 */
export function normalize(opts: IUserOpts) {
    const out: Partial<IOpts> = {};
    
    if (opts.pretty ?? true)
    {
        const temp = out.space = normalizeString(opts.space, " ");
        out.endl = normalizeString(opts.endl, "\n");
        const { tab } = opts;
        out.tab = typeof tab === "number" ? temp.repeat(tab) : normalizeString(tab, "\t");
    }
    else out.space = out.endl = out.tab = "";

    out.strRepeatMaxLengthOnKeys = opts.strRepeatMaxLengthOnKeys ?? false;
    out.strRepeatMaxLength = opts.strRepeatMaxLength ?? Infinity;
    out.depth = opts.depth ?? Infinity;
    out.factory = opts.factory ?? false;
    out.safe = opts.safe ?? false;
    out.var = opts.var ?? "x";
    
    return <IOpts>out;
}

/**
 * More permissive version of {@link IOpts}.
 * Can be passed to {@link normalize} to create an {@link IOpts}
 */
export interface IUserOpts extends Partial<IActualOpts> {
    pretty?: boolean;
    space?: string | boolean;
    endl?: string | boolean;
    tab?: string | number | boolean;
}

/** Formatting options and {@link IActualOpts} */
export interface IOpts extends IActualOpts {
    space: string;
    endl: string;
    tab: string;
}

/** Serialization options */
interface IActualOpts {
    strRepeatMaxLengthOnKeys: boolean;
    strRepeatMaxLength: number;
    depth: number;

    factory: boolean;
    safe: boolean;
    var: string;
}