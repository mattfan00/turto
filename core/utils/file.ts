import { path } from "../deps.ts";

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
