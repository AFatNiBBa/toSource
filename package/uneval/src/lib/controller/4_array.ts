
import { KeyStruct, PropDefer, PropStruct } from "../model/prop";
import { IStruct, RawStruct, RefStruct } from "../model/struct";
import { ProtoScanner_3 } from "./3_proto";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { Stats } from "../model/opts";

/** Scanner that handles arrays */
export abstract class ArrayScanner_4 extends ProtoScanner_3 {
    *scanArray(value: Array<unknown>, stats: Stats, ref: RefStruct): AwaitIterator<IStruct> {
        const { length } = value, items = new Array<IStruct | undefined>(length);
        if (++stats.depth <= stats.opts.depth) {
            for (var i = 0; i < length; i++) {
                if (!(i in value)) continue;
                const v = yield* this.scan(value[i], stats);
                const defer = v.getDefer();
                if (defer) defer.push(new PropDefer(ref, new PropStruct(new KeyStruct(new RawStruct(i.toString())), v)));
                else items[i] = v;
            }
        }
        stats.depth--;
        return new ArrayStruct(items);
    }
}

/** An {@link IStruct} that handles arrays, both sparse and not */
export class ArrayStruct implements IStruct {
    constructor(public items: (IStruct | undefined)[]) { }

    getRef() { return undefined; }

    getDefer() { return undefined; }
    
    writeTo(writer: CodeWriter, stats: Stats) {
        writer.write("[");
        const { items } = this, { length } = items;
        if (length > 0) {
            writer.enter();
            for (var i = 0; i < length; i++) {
                const elm = items[i];
                if (elm)
                    writer.endl(),
                    elm.writeTo(writer, stats, true);
                else if (!i)
                    writer.endl();
                if (!elm || i < length - 1)
                    writer.write(",");
            }
            writer.exit();
            writer.endl();
        }
        writer.write("]");
    }
}