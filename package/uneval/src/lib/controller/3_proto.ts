
import { IStruct, RefStruct } from "../model/struct";
import { ObjectScanner_2 } from "./2_object";
import { AwaitIterator } from "../async";
import { CodeWriter } from "../writer";
import { Stats } from "../model/opts";

/** Scanner that handles objects */
export abstract class ProtoScanner_3 extends ObjectScanner_2 {
    *scanObjectProto(value: object, expected: object, stats: Stats, ref: RefStruct, struct: IStruct): AwaitIterator<IStruct> {
        const proto = Object.getPrototypeOf(value);
        if (proto === expected) return struct;
        const temp = yield* this.scanObject(proto, stats);
        const defer = temp.getDefer();
        if (!defer) return new ObjectProtoStruct(struct, temp);
        defer.push(new ObjectProtoStruct(ref, temp));
        return struct;
    }

    *scanProto(_: object, ctor: Function, stats: Stats): AwaitIterator<IStruct> {
        return new ProtoStruct(yield* this.scanFunction(ctor, stats));
    }
}

/** An {@link IStruct} that handles an object and its prototype */
export class ObjectProtoStruct implements IStruct {
    constructor(public obj: IStruct, public proto: IStruct) { }

    getRef() { return this.obj.getRef(); }

    getDefer() { return this.proto.getDefer(); }
    
    writeTo(writer: CodeWriter, stats: Stats) {
        writer.write("Object.setPrototypeOf(");
        writer.enter();
        writer.endl(false);
        this.obj.writeTo(writer, stats, true);
        writer.write(",");
        writer.endl();
        this.proto.writeTo(writer, stats, true);
        writer.exit();
        writer.endl(false);
        writer.write(")");
    }
}

/** An {@link IStruct} that handles an object which IS a prototype */
export class ProtoStruct implements IStruct {
    constructor(public ctor: IStruct) { }

    getRef() { return undefined; }

    getDefer() { return this.ctor.getDefer(); }
    
    writeTo(writer: CodeWriter, stats: Stats) {
        this.ctor.writeTo(writer, stats, false);
        writer.write(".prototype");
    }
}