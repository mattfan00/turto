import { commander } from "../deps.ts";
import { initHandler } from "./handlers/init.ts";

const turtoProgram = new commander.Command();

turtoProgram
  .name("turto")
  .description("The turto static site generator");

turtoProgram.command("init")
  .description("Create a new turto project")
  .argument("[dirname]", "directory name to create project in")
  .action(initHandler);

turtoProgram.parse();
