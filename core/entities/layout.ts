import { Base } from "./base.ts";

export class Layout extends Base {
  constructor(baseDir: string, pathRelative: string, rawContent: string) {
    super(baseDir, pathRelative);
    this.rawContent = rawContent;
  }
}