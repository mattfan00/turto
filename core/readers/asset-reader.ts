import { Reader } from "./reader.ts";
import { readDirRecursive } from "../utils/file.ts";
import { ASSETS_DIRNAME } from "../utils/constants.ts";
import { Asset } from "../entities/asset.ts";

export class AssetReader extends Reader {
  constructor(src: string) {
    super(src, ASSETS_DIRNAME);
  }

  read() {
    return readDirRecursive(this.dir)
      .map((pathRelative) => {
        return new Asset(this.dir, pathRelative);
      });
  }
}
