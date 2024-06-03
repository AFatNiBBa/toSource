
import { IOpts } from "./model/opts";

/** A string builder specialized for writing JavaScript code without worrying about indentation */
export class CodeWriter {
    result = "";
    level = 0;

    constructor(public opts: IOpts) { }

    /** Outputs the current result */
    toString() { return this.result; }

    /** Adds a level of indentation to all subsequent new-lines until {@link exit} gets called */
    enter() { this.level++; }

    /** Removes a level of indentation to all subsequent new-lines */
    exit() { this.level--; }

    /** Writes a series of space-delimited strings */
    write(...str: string[]) { this.result += str.join(this.opts.space); }

    /** Writes a new-line */
    endl() {
        const { space, endl, tab } = this.opts;
        this.result += space + endl + tab.repeat(this.level);
    }
}