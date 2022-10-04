import { commander } from "../deps.ts";
import { initHandler } from "./handlers/init.ts";
import { buildHandler } from "./handlers/build.ts";
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
  .argument("[dirname]", "directory to create project in")
  .option(
    "--template <name>",
    "specify a template to bootstrap the project with (provide the name of an official template or a GitHub URL)",
    "starter",
  )
  .action(initHandler);

turtoProgram.command("build")
  .description("Build your site")
  .option("-s, --src <src>", "directory to read from")
  .option("-d, --dest <dest>", "directory to write generated site to")
  .action(buildHandler);

try {
  await turtoProgram.parseAsync();
} catch (error) {
  if (error instanceof CliError) {
    turtoProgram.error(error.message, error.errorOptions);
  } else if (error instanceof Error) {
    turtoProgram.error(error.message);
  }
}
