
import { serialize } from "./util";

test("base", () => {
    const a: any = {};
    a.b = a;
    const f: any = { a };
    a.c = new Proxy(f, f);
    a.d = a.c;
    a.g = Object.setPrototypeOf(a, a.c);

    const e = serialize(f, true);
    console.log(e);
});