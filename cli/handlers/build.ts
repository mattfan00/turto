import { turto } from "../../mod.ts";
import { styles } from "../utils.ts";
import { Watcher } from "../watcher.ts";

export interface BuildOptions {
  src?: string;
  dest?: string;
  watch?: string;
}

export const buildHandler = async (options: BuildOptions) => {
  const site = turto(options);
  site.build();

  if (options.watch) {
    const watcher = new Watcher();
    console.log(
      `Started watching for changes in ${styles.file(site.getSrc())}`,
    );

    await watcher.watch();
  }
};
