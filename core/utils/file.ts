import { path } from "../deps.ts"

export const readDirRecursive = (dirname: string, files?: string[]) => {
  if (!files) {
    files = []
  }

  for (const dirEntry of Deno.readDirSync(dirname)) {
    const fullPath = path.join(dirname, dirEntry.name)
    if (dirEntry.isFile) {
      files.push(fullPath)
    } else {
      readDirRecursive(fullPath, files)
    }
  }

  return files
}