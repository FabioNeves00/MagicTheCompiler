import { RuntimeValue } from "@app/types";

export function makeArray(elements: RuntimeValue[]) {

    type: "array",
    value: elements
  }
}