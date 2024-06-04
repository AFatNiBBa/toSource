import { FunctionScanner_6 } from "./lib/controller/6_function";
import { IOpts, Stats } from "./lib/model/opts";
import { CodeWriter } from "./lib/writer";
import { callSync } from "./lib/async";

export { FunctionScanner_6 as Scanner };

const scanner = new FunctionScanner_6();

const opts: IOpts = Stats.normalize({
	strRepeatMaxLengthOnKeys: true,
	strRepeatMaxLength: 12,
	tab: 2
});

const stats = new Stats(opts);
const a = [] as unknown[];
a.push(a);
const s = Symbol();
const g = Object(s);

const struct = callSync(
	scanner.scan(
		{
			a: [, , -0, "ca", , , , "ca", "ciao beppe come va, tutto bene?", [a, true, a], "ciao beppe come va, tutto bene?", ,],
			b: a,
			c: { 变量: "ciao beppe come va, tutto bene?", 3: 1, [s]: s, [Symbol.iterator]: s },
			[s]: Symbol("ciao"),
			g,
			h: g,
			f: new String("beppe"),
			i: Symbol("ciao"),
			[Symbol.for("ciao beppe come va, tutto bene?")]: Symbol.for("ciao beppe come va, tutto bene?"),
			ciaciacicacaca: 1,
			ciaciacicacac: "ciaciacicacac",
			" ": 3,
			ungue: [/caiccioa/gi, new Date(2002, 3, 19)],
			get alfa() {
				return this;
			}
		},
		stats
	)
);

struct.getRef()!.deferred.push({ notify: () => true, getRef: () => undefined, writeTo: x => x.write("1") });

console.log(struct);
const writer = new CodeWriter(opts);
console.log("////////////////////////////////////////////////////////////////////////////////////////////////////////////////////");
writer.write("((x = {}) => ");
struct.writeTo(writer, stats, false);
writer.write(")()");
console.log(writer.toString());
