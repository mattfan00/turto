import { chalk, commander } from "../deps.ts";
import { initHandler } from "./handlers/init.ts";
import { CliError } from "./utils.ts";

const turtoProgram = new commander.Command();

turtoProgram
  .name("turto")
  .description("The turto static site generator")
  .configureOutput({
    outputError: (str, write) => write(`${chalk.bold.red("[error]")} ${str}`),
  });

turtoProgram.command("init")
  .description("Create a new turto project")
  .argument("[dirname]", "directory name to create project in")
  .action(initHandler);

try {
  turtoProgram.parse();
} catch (error) {
  if (error instanceof CliError) {
    turtoProgram.error(error.message, error.errorOptions);
  } else if (error instanceof Error) {
    turtoProgram.error(error.message)
  }
}