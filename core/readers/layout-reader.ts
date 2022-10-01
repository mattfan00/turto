import { Reader } from "./reader.ts";
import { readDirRecursive } from "../utils/file.ts";
import { LAYOUTS_DIRNAME } from "../utils/constants.ts";
import { Layout } from "../entities/layout.ts";
import { Renderer } from "../engines/renderer.ts";
import { path } from "../../deps.ts";

export class LayoutReader extends Reader {
  renderer: Renderer;

  constructor(src: string, renderer: Renderer) {
    super(src, LAYOUTS_DIRNAME);
    this.renderer = renderer;
  }

  read() {
    return readDirRecursive(this.dir)
      .map((pathRelative) => {
        const fullPath = path.join(this.dir, pathRelative);
        const rawContent = Deno.readTextFileSync(fullPath);

        const layout = new Layout(this.dir, pathRelative, rawContent);

        this.renderer.compile(layout.name, rawContent);

        return layout;
      });
  }
}
