
import { serialize } from "./util";

test("base", () => {
    const a: any = {};
    a.b = a;
    const f: any = { a };
    a.c = new Proxy(a, f);
    a.d = a.c;

    const e = serialize(f, true);
    console.log(e);
});