
import { check } from "./util";

describe("standard", () => {
    const a: any = {};
    a.b = a.c = { a, tel: /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ig };
    a.e = a;

    check("base", a, "((x={})=>(x[0]={c:x[1]={tel:/^(\\+0?1\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$/gi},b:x[1]},x[1].a=x[0],x[0].e=x[0]))()");
});