
import { serialize } from "./util";

test("base", () => {
    const a: any = {};
    a.b = a;
    a.c = new Proxy(a, a);
    a.d = a.c;

    const e = serialize(a, true);
    console.log(e);
});