
import { Stats } from "./lib/model/opts";
import { unevalSync } from ".";

const a: any = {};
a.b = a.c = { a, url: /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ig };
a.e = a;

const opts = Stats.normalize({ tab: 2 });
const string = unevalSync(a, opts);
console.log(string);