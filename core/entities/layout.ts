import { Base, RawContent } from "./base.ts";

export class Layout extends Base implements RawContent {
  rawContent: string;

  constructor(baseDir: string, pathRelative: string, rawContent: string) {
    super(baseDir, pathRelative);
    this.rawContent = rawContent;
  }
}
