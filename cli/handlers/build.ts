import { turto } from "../../mod.ts";
import { styles } from "../utils.ts";
import { Watcher } from "../../deps.ts";

export interface BuildOptions {
  src?: string;
  dest?: string;
  watch?: string;
}

export const buildHandler = async (options: BuildOptions) => {
  const site = turto(options);
  site.build();

  if (options.watch) {
    const watcher = new Watcher(site.options.src);
    console.log(
      `Started watching for changes in ${styles.file(site.getSrc())}\n`,
    );

    watcher.use((ctx) => {
      const { event } = ctx;
      if (event === "create") {
        console.log("in middleware created " + ctx.path);
      } else if (event === "modify") {
        console.log("in middleware modify " + ctx.path);
      } else if (event === "remove") {
        console.log("in middleware remove " + ctx.path);
      }
    });

    await watcher.watch();
  }
};
