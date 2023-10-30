import { Parser } from "./modules/parser";
import { createGlobalEnvironment } from "./modules/runtime/environment";
import { evaluateProgram } from "./modules/runtime/interpreter";
import { join } from "path"

const data = Bun.file(join(import.meta.dir, process.argv[2]))
const source_code = await data.text()
const evaluated = evaluateProgram(
  new Parser().generateAbstractSyntaxTree(source_code),
  createGlobalEnvironment()
);
console.log(evaluated);
