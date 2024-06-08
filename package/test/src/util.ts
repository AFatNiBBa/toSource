
import { Scanner, Stats, unevalSync } from "uneval.js";
import { proxyPlugin } from "uneval-plugin-v8";

/** Creates a new {@link Scanner} with my plugins applied */
const v8 = Scanner.plugin(proxyPlugin);

/**
 * Serializes an object
 * @param x The object to serialize
 * @param pretty Tells whether the resulting string should be serialized
 */
export const serialize = (x: unknown, pretty = false) => unevalSync(x, Stats.normalize({ pretty, tab: 2, scanner: v8.prototype }));

/**
 * Ensures that the compiler doesn't change the source of functions to much
 * @param x The string to clean
 */
export const sanitize = (x: string) => x.replace(/\{\s+\}/g, "{}");

/**
 * Serializes an object and the deserializes it back
 * @param x The object to serialize
 */
export const back = <T>(x: T) => <T>(0,eval)(serialize(x));

/**
 * Runs an automatic serialization test
 * @param name The name of the test
 * @param x The object to serialize
 * @param str The expected resulting string
 */
export const check = (name: string, x: unknown, str: string) => test(name, () => expect(sanitize(serialize(x))).toBe(str));