import { commander } from "../deps.ts";
import { CliError, optionParseInt, styles } from "./utils.ts";

import { initHandler } from "./handlers/init.ts";
import { buildHandler } from "./handlers/build.ts";
import { serveHandler } from "./handlers/serve.ts";

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

const srcOption = new commander.Option(
  "-s, --src <src>",
  "directory to read from",
);
const destOption = new commander.Option(
  "-d, --dest <dest>",
  "directory to write generated site to",
);

turtoProgram.command("build")
  .description("Build your site")
  .addOption(srcOption)
  .addOption(destOption)
  .action(buildHandler);

turtoProgram.command("serve")
  .description("Build your site and start a server to serve it")
  .addOption(srcOption)
  .addOption(destOption)
  .option("-p, --port <port>", "port to listen on", optionParseInt, 3000)
  .action(serveHandler);

try {
  await turtoProgram.parseAsync();
} catch (error) {
  if (error instanceof CliError) {
    turtoProgram.error(error.message, error.errorOptions);
  } else if (error instanceof Error) {
    turtoProgram.error(error.message);
  }
}
