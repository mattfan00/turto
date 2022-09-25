import { path } from "../deps.ts";

/**
 * Base class that all entities extend from. Handles file information.
 */
export class Base {
  /** Full path relative to `Deno.cwd()` */
  path: string;
  /** Base directory the file was read from */
  baseDir: string;
  /** Relative to the base directory */
  pathRelative: string;
  /** Filename without extension */
  name: string;
  /** Full filename */
  base: string;
  /** File extension */
  ext: string;
  /** Unmodified utf8 encoded string content of file */
  rawContent?: string;

  constructor(baseDir: string, pathRelative: string) {
    const parsedPath = path.parse(pathRelative);

    this.path = path.join(baseDir, pathRelative);
    this.baseDir = baseDir;
    this.pathRelative = pathRelative;
    this.name = parsedPath.name;
    this.base = parsedPath.base;
    this.ext = parsedPath.ext;
  }
}
