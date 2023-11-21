import { FunctionValue, StatementType } from "@app/types";
import Environment from "../../modules/runtime/environment";

export function makeFunction(name: string, params: string[], body: StatementType[], env: Environment): FunctionValue {
    return {
        type: "function",
        name,
        params,
        body,
        env
    };
}