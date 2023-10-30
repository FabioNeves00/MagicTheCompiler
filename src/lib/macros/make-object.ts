import { BooleanValue, ObjectValue, RuntimeValue } from "@app/types";

export function makeObject(): ObjectValue {
    return { type: "object", properties: new Map<string, RuntimeValue>() };
}