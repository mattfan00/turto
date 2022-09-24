import { Base } from "./base.ts";

export class Asset extends Base {
  constructor(baseDir: string, pathRelative: string) {
    super(baseDir, pathRelative);
  }
}
