import { runMod, styles } from "../utils.ts";
import { Watcher } from "../../deps.ts";
import { Server } from "../server.ts";
import { normalizeDir } from "../../core/utils/file.ts";

export interface DevOptions {
  port: number;
  base: string;
}

export const devHandler = async (options: DevOptions) => {
  const src = Deno.cwd();
  await runMod(src);

  const server = new Server({ base: options.base });
  server.listen({ port: options.port });
  const serverUrl = `http://localhost:${options.port}`;
  console.log(
    `Started server on port ${options.port}, url: ${styles.link(serverUrl)}`,
  );

  const watcher = new Watcher(src, {
    ignore: `**/${normalizeDir(options.base)}/**`,
  });
  console.log(
    `Started watching for changes in ${styles.file(src)}\n`,
  );

  watcher.use(async () => {
    console.log("building...");
    const start = performance.now();
    await runMod(src);
    const duration = performance.now() - start;
    console.log(`finished build successfully in ${duration.toFixed(0)}ms`);
  });

  watcher.watch();
};
