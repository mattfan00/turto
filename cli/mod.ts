import { commander } from "../deps.ts";
import { initHandler } from "./handlers/init.ts";
import { CliError, styles } from "./utils.ts";

const turtoProgram = new commander.Command();

turtoProgram
  .name("turto")
  .description("The turto static site generator")
  .configureOutput({
    outputError: (str, write) => write(`${styles.error("[error]")} ${str}`),
  });

turtoProgram.command("init")
  .description("Create a new turto project")
  .argument("[dirname]", "Directory name to create project in")
  .option(
    "--template <name>",
    "Specify a template to bootstrap the project with. Provide the name of an official template or a GitHub URL",
    "starter",
  )
  .action(initHandler);

try {
  await turtoProgram.parseAsync();
} catch (error) {
  if (error instanceof CliError) {
    turtoProgram.error(error.message, error.errorOptions);
  } else if (error instanceof Error) {
    turtoProgram.error(error.message);
  }
}
