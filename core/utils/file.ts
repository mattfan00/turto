import { path } from "../../deps.ts";

/**
 * Synchronously reads the directory in `rootDir` and returns a
 * list of all the files.
 *
 * ```ts
 * const fileList = readDirRecursive("./test")
 * ```
 *
 * `subDir` and `files` can be, but should not be initialized as
 * they are mainly used for recursion purposes.
 */
export const readDirRecursive = (
  rootDir: string,
  subDir = "./",
  files: string[] = [],
) => {
  const currentDir = path.join(rootDir, subDir);
  for (const dirEntry of Deno.readDirSync(currentDir)) {
    const relPath = path.join(subDir, dirEntry.name);
    if (dirEntry.isFile) {
      files.push(relPath);
    } else {
      readDirRecursive(rootDir, relPath, files);
    }
  }

  return files;
};

/**
 * Returns a list of all the directories in a path.
 */
export const listDirs = (p: string) => {
  return path.dirname(p)
    .split("/")
    .filter((s) => s !== "." && s !== "");
};

/**
 * Decides whether or not to append the value in `name` to path `p` depending
 * on the value at `name`.
 *
 * Commonly used to make sure paths don't end in "index".
 */
export const appendName = (p: string, name: string) => {
  if (name === "index") {
    return p;
  }

  return path.join(p, name);
};
