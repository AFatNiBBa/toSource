
import { AwaitIterator, callAsync, callSync } from "./lib/async";
import { IOpts, Stats } from "./lib/model/opts";
import { CodeWriter } from "./lib/writer";

export { SymbolStruct } from "./lib/controller/1_symbolString";
export { WrapperStruct, ObjectStruct } from "./lib/controller/2_object";
export { ObjectProtoStruct, ProtoStruct } from "./lib/controller/3_proto";
export { ArrayStruct } from "./lib/controller/4_array";
export * from "./lib/model/opts";
export * from "./lib/model/prop";
export * from "./lib/model/scanner";
export * from "./lib/model/struct";
export * from "./lib/async";
export * from "./lib/writer";

/**
 * Synchronous version of {@link uneval}
 * @param value The value to serialize
 * @param opts The serialization options
 */
export const unevalSync = (value: unknown, opts: IOpts) => callSync(uneval(value, opts));

/**
 * Asynchronous version of {@link uneval}
 * @param value The value to serialize
 * @param opts The serialization options
 */
export const unevalAsync = (value: unknown, opts: IOpts) => callAsync(uneval(value, opts));

/**
 * Serializes any reasonable JavaScript value.
 * The "synchronicity" of the function depends on how you call it.
 * You probably want to use {@link unevalSync} or {@link unevalAsync} instead
 * @param value The value to serialize
 * @param opts The serialization options
 */
export function *uneval(value: unknown, opts: IOpts): AwaitIterator<string> {
	const stats = new Stats(opts);
	const struct = yield* opts.scanner.scanTop(value, stats);
	const writer = new CodeWriter(opts);
	struct.writeTo(writer, stats, !opts.safe);
	return writer.toString();
}

export default unevalSync;