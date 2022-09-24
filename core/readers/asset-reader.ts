import { Reader } from "./reader.ts"
import { readDirRecursive } from "../utils/file.ts";

export class AssetReader extends Reader {
  constructor(src: string) {
    super(src, "assets")
  }

  read() {
    console.log(readDirRecursive(this.dir))
  }
}