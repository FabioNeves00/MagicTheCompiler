import { Parser } from "./modules/parser";
import inquirer from "inquirer";
import { evaluateProgram } from "./modules/runtime/interpreter";
import Environment, { createGlobalEnvironment } from "./modules/runtime/environment";

const app = async () => {
  const parser = new Parser();
  const env = createGlobalEnvironment();
  while (true) {
    await inquirer.prompt(
      {
        type: "input",
        name: "sourceCode",
        message: "Welcome to Magic: The Compiler \n > ",
      },
    ).then(({ sourceCode }) => {
      const ast = parser.generateAbstractSyntaxTree(sourceCode);
      const result = evaluateProgram(ast, env)
    })
  }
};

app();
