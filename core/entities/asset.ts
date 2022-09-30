import { path } from "../deps.ts";
import { Base, Convertible, UrlCompatible } from "./base.ts";
import { ASSETS_DIRNAME } from "../utils/constants.ts";

export class Asset extends Base implements Convertible, UrlCompatible {
  url: string;

  constructor(baseDir: string, pathRelative: string) {
    super(baseDir, pathRelative);

    this.url = path.join("/", ASSETS_DIRNAME, this.pathRelative);
  }

  convertToData() {
    return {
      url: this.url,
      name: this.name,
      base: this.base,
      ext: this.ext,
    };
  }
}
