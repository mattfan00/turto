import { Reader } from "./reader.ts";
import { readDirRecursive } from "../utils/file.ts";
import { PAGES_DIRNAME } from "../utils/constants.ts";
import { Page } from "../entities/page.ts";
import { path } from "../deps.ts";

export class PageReader extends Reader {
  constructor(src: string) {
    super(src, PAGES_DIRNAME);
  }

  read() {
    return readDirRecursive(this.dir)
      .map((pathRelative) => {
        const fullPath = path.join(this.dir, pathRelative);
        const fileInfo = Deno.statSync(fullPath);
        const rawContent = Deno.readTextFileSync(fullPath);

        return new Page(
          this.dir,
          pathRelative,
          rawContent,
          fileInfo.birthtime,
        );
      });
  }
}
