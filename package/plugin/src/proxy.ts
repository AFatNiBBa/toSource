
import { AwaitIterator, IStruct, RefStruct, Scanner, Stats } from "uneval.js";
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
        scanProxy(proxy: object, target: object, handler: ProxyHandler<object>, stats: Stats): AwaitIterator<IStruct> {
            throw new Error("Method not implemented.");
        }
    };
}