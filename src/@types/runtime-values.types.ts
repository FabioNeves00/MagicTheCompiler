import { StatementType } from ".";
import Environment from "../modules/runtime/environment";

export type ValueType = "null" | "number" | "boolean" | "object" | "built-in-function" | "function" | "string";

export type RuntimeValue = {
  type: ValueType
}

export type NullValue = RuntimeValue & {
  type: "null",
  value: null
}

export type BooleanValue = RuntimeValue & {
  type: "boolean",
  value: boolean
}

export type NumberValue = RuntimeValue & {
  type: "number",
  value: number
}

export type ObjectValue = RuntimeValue & {
  type: "object",
  properties: Map<string, RuntimeValue>
}

export type FunctionCall = (
  args: any[],
  env: Environment
) => RuntimeValue;

export type BuiltInFunctionValue = RuntimeValue & {
  type: "built-in-function",
  call: FunctionCall
}

export type FunctionValue = RuntimeValue & {
  type: "function",
  name: string,
  params: string[],
  body: StatementType[],
  env: Environment
}

export type StringValue = RuntimeValue & {
  type: "string",
  value: string
}
