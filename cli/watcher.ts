import { path } from "../deps.ts";

export type Event = "create" | "modify" | "remove";

export interface Options {
  recursive: boolean;
  base: string;
}

const defaultOptions: Options = {
  recursive: true,
  base: Deno.cwd(),
};

export class Watcher {
  paths: string[] = [];
  options: Options;

  constructor(paths?: string | string[], options?: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (paths) {
      this.add(paths);
    }
  }

  add(paths: string | string[]) {
    const { base } = this.options;
    if (Array.isArray(paths)) {
      const modifiedPaths = paths.map((p) => path.join(base, p));
      this.paths = [...this.paths, ...modifiedPaths];
    } else {
      this.paths.push(path.join(base, paths));
    }
  }

  async watch() {
    if (this.paths.length === 0) {
      throw new Error("No paths provided to watch for");
    }
    const watcher = Deno.watchFs(this.paths, {
      recursive: this.options.recursive,
    });

    for await (const event of watcher) {
      console.log(new Date());
      console.log(event);
    }
  }
}
