import { commander } from "../deps.ts";
import { CliError, optionParseInt, styles } from "./utils.ts";

import { initHandler } from "./handlers/init.ts";
import { buildHandler } from "./handlers/build.ts";
import { devHandler } from "./handlers/dev.ts";

const program = new commander.Command();

program
  .name("turto")
  .description("The turto static site generator")
  .configureOutput({
    outputError: (str, write) => write(`${styles.error("[error]")} ${str}`),
  });

program.command("init")
  .description("Create a new turto project")
  .argument("[dirname]", "directory to create project in")
  .option(
    "--template <name>",
    "specify a template to bootstrap the project with (provide the name of an official template or a GitHub URL)",
    "starter",
  )
  .action(initHandler);

program.command("build")
  .description("Build your site")
  .action(buildHandler);

program.command("dev")
  .description(
    "Build your application in development mode (file watcher, server, etc.)",
  )
  .option("-p, --port <port>", "port to listen on", optionParseInt, 3000)
  .option("-b, --base <base>", "base directory to serve files from", "_site")
  .action(devHandler);

export const start = async () => {
  try {
    await program.parseAsync();
  } catch (error) {
    if (error instanceof CliError) {
      program.error(error.message, error.errorOptions);
    } else if (error instanceof Error) {
      program.error(error.message);
    }
  }
};
