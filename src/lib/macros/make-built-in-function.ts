import { BuiltInFunctionValue, FunctionCall } from "@app/types";

export function makeBuiltInFunction(call: FunctionCall): BuiltInFunctionValue {
  return {
    type: "built-in-function",
    call
  }
}