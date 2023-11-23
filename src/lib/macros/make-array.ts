import { RuntimeValue } from "@app/types";

export function makeArray(elements: RuntimeValue[]) {
  return {
    type: "array",
    value: elements
  }
}