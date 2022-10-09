import { path } from "../deps.ts";

export type Middleware = (
  ctx: Context,
  next: () => Promise<void>,
) => Promise<void> | void;

export class Watcher {
  paths: string[] = [];
  options: Options;
  #middlewares: Middleware[] = [];

  constructor(paths?: string | string[], options?: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (paths) {
      this.addPaths(paths);
    }
  }

  addPaths(paths: string | string[]) {
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
      await this.#handleEvent(event);
    }
  }

  async #handleEvent(event: Deno.FsEvent) {
    const context: Context = {
      path: event.paths,
      file: Deno.statSync(event.paths[0]),
      raw: event,
    }

    let currIndex = -1;

    const next = async () => {
      // TODO: add check for calling next() twice
      currIndex += 1;
      const middleware = this.#middlewares[currIndex];
      if (!middleware) {
        return
      }

      await middleware(context, next)
    }

    await next();
  }

  use(fn: Middleware) {
    this.#middlewares.push(fn);
  }
}

export interface Options {
  recursive: boolean;
  base: string;
}

const defaultOptions: Options = {
  recursive: true,
  base: Deno.cwd(),
};

export interface Context {
  path: string[];
  file: Deno.FileInfo;
  raw: Deno.FsEvent;
}
