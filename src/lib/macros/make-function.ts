import { FunctionValue, StatmentType } from "@app/types";
import Environment from "../../modules/runtime/environment";

export function makeFunction(name: string, params: string[], body: StatmentType[], env: Environment): FunctionValue {
    return {
        type: "function",
        name,
        params,
        body,
        env
    };
}