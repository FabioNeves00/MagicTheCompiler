import { Parser } from "../../src/modules/parser";
import Environment, { createGlobalEnvironment } from "../../src/modules/runtime/environment";
import { evaluateProgram } from "../../src/modules/runtime/interpreter";
import { join } from "path"

const data = Bun.file(join(import.meta.dir, 'test.mtg'))
const source_code = await data.text()
const evaluated = evaluateProgram(
  new Parser().generateAbstractSyntaxTree(source_code),
  createGlobalEnvironment()
);