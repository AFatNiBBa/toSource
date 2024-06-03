
import { RefStruct } from "./struct";
import { IOpts } from "./opts";

/** Object that represents the state of the current serialization */
export class Stats {
    cache = new Map<unknown, RefStruct>();
    id = 0;

    constructor(public opts: IOpts) { }
}