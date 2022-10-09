import { path } from "../deps.ts";

export type Next = () => Promise<void>;

export type Middleware = (
  ctx: Context,
  next: Next,
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
    };
    let prevIndex = -1;

    const next = async (i: number) => {
      if (i <= prevIndex) {
        throw new Error("next() is called multiple times in one middleware");
      }
      const middleware = this.#middlewares[i];
      if (!middleware) {
        return;
      }
      prevIndex = i;

      await middleware(context, next.bind(null, i + 1) as Next);
    };

    await next(0);
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
