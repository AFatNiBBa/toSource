
import { IStruct, RawStruct, RefStruct } from "../model/struct";
import { KeyStruct, PropDefer } from "../model/prop";
import { ObjectScanner_2 } from "./2_object";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { Stats } from "../model/stats";

/** Scanner that handles arrays */
export abstract class ArrayScanner_3 extends ObjectScanner_2 {
    *scanArray(value: Array<unknown>, stats: Stats, ref: RefStruct): AwaitIterator<IStruct> {
        const { length } = value, items = new Array<IStruct | undefined>(length);
        for (var i = 0; i < length; i++)
            if (i in value)
                items[i] = PropDefer.check(yield* this.scan(value[i], stats), ref, () => new KeyStruct(new RawStruct(i.toString())));
        return new ArrayStruct(items);
    }
}

/** An {@link IStruct} that handles arrays, both sparse and not */
export class ArrayStruct implements IStruct {
    constructor(public items: (IStruct | undefined)[]) { }

    getRef() { return undefined; }
    
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