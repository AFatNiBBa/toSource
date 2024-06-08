
import { AwaitIterator, CodeWriter, IStruct, RefStruct, Scanner, Stats } from "uneval.js";
import { getProxyData } from "internal-prop";

/**
 * Adds proxy traversal abilities to {@link ctor}
 * @param ctor The {@link Scanner} class to extend
 */
export function proxyPlugin(ctor: typeof Scanner) {
    return class extends ctor {
        scanObjectInner(value: object, stats: Stats, ref: RefStruct): AwaitIterator<IStruct> {
            const temp = getProxyData(value);
            return temp
                ? this.scanProxy(value, temp.target, temp.handler, stats)
                : super.scanObjectInner(value, stats, ref);
        }

        scanFunctionInner(value: Function, stats: Stats): AwaitIterator<IStruct> {
            const temp = getProxyData(value);
            return temp
                ? this.scanProxy(value, temp.target, temp.handler, stats)
                : super.scanFunctionInner(value, stats);
        }

        /**
         * Traverses a proxy
         * @param proxy The value to traverse
         * @param target The target of {@link proxy}
         * @param handler The handler of {@link proxy}
         * @param stats The state of the current serialization
         */
        *scanProxy(proxy: object, target: object, handler: ProxyHandler<object>, stats: Stats): AwaitIterator<IStruct> {
            return new ProxyStruct(yield* this.scanObject(target, stats), yield* this.scanObject(handler, stats));
        }
    };
}

/** An {@link IStruct} that handles proxies */
export class ProxyStruct implements IStruct {
    constructor(public target: IStruct, public handler: IStruct) { }

    getRef() { return undefined; }

    getDefer() { return RefStruct.circ(this.target, this.handler); }
    
    writeTo(writer: CodeWriter, stats: Stats) {
        writer.write("new Proxy(");
        writer.enter();
        writer.endl(false);
        this.target.writeTo(writer, stats, true);
        writer.write(",");
        writer.endl();
        this.handler.writeTo(writer, stats, true);
        writer.exit();
        writer.endl(false);
        writer.write(")");
    }
}