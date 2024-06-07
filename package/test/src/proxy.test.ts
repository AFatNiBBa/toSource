
import { serialize } from "./util";

test("proto", () => {
    expect(() => serialize(new Proxy({}, {}))).toThrow();
});