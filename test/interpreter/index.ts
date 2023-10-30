import { Parser } from "../../src/modules/parser";
import { createGlobalEnvironment } from "../../src/modules/runtime/environment";
import { evaluateProgram } from "../../src/modules/runtime/interpreter";

const TEST_CODE = "10 + 10 - 15 * 2 / 4 + (10 - 1)";

console.log("TEST_CODE: ", TEST_CODE);
const evaluated = evaluateProgram(
  new Parser().generateAbstractSyntaxTree(TEST_CODE),
  createGlobalEnvironment()
);
console.log(evaluated);
