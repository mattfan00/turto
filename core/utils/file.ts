import { micromatch, MicromatchOptions, path } from "../../deps.ts";

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
  ignore?: string[],
  ignoreOptions?: MicromatchOptions,
  subDir = "./",
  files: string[] = [],
) => {
  const currentDir = path.join(rootDir, subDir);
  for (const dirEntry of Deno.readDirSync(currentDir)) {
    const relPath = path.join(subDir, dirEntry.name);
    if (ignore && micromatch.isMatch(relPath, ignore, ignoreOptions)) {
      continue;
    }

    if (dirEntry.isFile) {
      files.push(relPath);
    } else {
      readDirRecursive(rootDir, ignore, ignoreOptions, relPath, files);
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

export const trimPrefix = (s: string, prefix: string) => {
  if (prefix !== "" && s.startsWith(prefix)) {
    return s.slice(prefix.length);
  }
  return s;
};

export type ValidateDirTypes = "absolute" | "previous" | "base";

export const validateDir = (dir: string, types?: ValidateDirTypes[]) => {
  if (!types) {
    types = ["absolute", "previous", "base"];
  }
  const normalized = path.normalize(dir);
  for (const type of types) {
    if (type === "absolute") {
      if (path.isAbsolute(dir)) {
        throw new Error(`${dir} cannot be an absolute path`);
      }
    } else if (type === "previous") {
      if (normalized.startsWith("../")) {
        throw new Error(`${dir} cannot be a previous directory`);
      }
    } else if (type === "base") {
      if (normalized === (".") || normalized === "./") {
        throw new Error(`${dir} cannot be the base directory`);
      }
    }
  }
};

export const normalizeDir = (dir: string) => {
  let newPath = path.normalize(dir);
  if (newPath.endsWith("/")) {
    newPath = newPath.slice(0, newPath.length - 1);
  }
  const prefix = newPath.slice(0, newPath.indexOf("/"));
  if (prefix === "." || prefix === "..") {
    newPath = newPath.slice(newPath.indexOf("/") + 1);
  }

  return path.normalize(newPath);
};
