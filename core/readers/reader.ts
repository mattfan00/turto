import { path } from "../deps.ts"

export class Reader {
  /** Name of the directory to read files from */
  dir: string

  constructor(src: string, dirname: string) {
    this.dir = path.join(src, dirname)
  }
}