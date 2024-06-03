
import { ArrayScanner_3 } from "./3_array";
import { IStruct } from "../model/struct";
import { Stats } from "../model/stats";

/** Scanner that handles functions */
export class FunctionScanner_6 extends ArrayScanner_3 {
    scanFunction(value: Function, stats: Stats): IStruct {
        return this.scanRef(value, stats, () => this.scanFunctionInner(value, stats));
    }

    /**
     * Traverses a function without checking for multiple references
     * @param value The value to traverse
     * @param stats The state of the current serialization
     */
    scanFunctionInner(value: Function, stats: Stats): IStruct {
        throw new Error("Method not implemented.");
    }   
}