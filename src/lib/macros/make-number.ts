import { NumberValue } from '@app/types';

export function makeNumber(value = 0): NumberValue {
  return { type: "number", value };
}