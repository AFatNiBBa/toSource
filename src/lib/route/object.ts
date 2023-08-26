
import { IResult, Serializer, FAIL } from "../../helper/serializer";
import { getFormat, wrap } from "../../helper/util";
import { Stats } from "../../helper/stats";
import { getFunc } from "./func";
import { Key } from "../util/key";
import { getRef } from "./ref";
import { Circ } from "./circ";

export const OBJECT: Serializer = (x, stats) => typeof x === "object" ? new Obj(stats, x) : FAIL;

export class Obj implements IResult {
    list: IResult[] = [];

    constructor(public stats: Stats, obj: object) {
        if (++stats.depth <= stats.opts.depth)
        {
            for (const k of Reflect.ownKeys(obj))
            {
                var v = obj[k];
                const struct = Circ.tryOrAssign(stats, obj, k, v);
                if (!struct)
                    if (k === "__proto__") v = undefined; // If the it is the "__proto__" property (Or it is explicitly requested) it has to get defined to avoid setting the actual prototype
                    else continue;

                if (stats.opts.method && typeof v === "function" && v.name === k)
                {
                    const func = getFunc(stats, v);
                    if (func.first && !getRef(stats, v)?.used)
                    {
                        this.list.push(func.source);
                        continue;
                    }                    
                }

                this.list.push(wrap`${ new Key(stats, k, true) }:${ this.stats.opts.space }${ struct ?? "undefined" }`);
            }
        }
        stats.depth--;
    }

    toString(level: string, safe: boolean): string {
        if (this.list.length === 0) return safe ? "{}" : "({})";
        const { LAST, FULL, NEXT } = getFormat(this.stats.opts, level);

        var out = "";
        for (const elm of this.list)
            out += `${ out && "," }${ FULL }${ elm.toString(NEXT, true) }`;
            
        out = `{${ out }${ LAST }}`;
        return safe ? out : `(${ out })`;
    }
}