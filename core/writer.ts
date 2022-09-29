import { fs, path } from "./deps.ts";
import { Asset } from "./entities/asset.ts";
import { Page } from "./entities/page.ts";
import { Renderer } from "./renderer.ts";
import { ASSETS_DIRNAME } from "./utils/constants.ts";
import { appendName } from "./utils/file.ts";
import type { Object } from "./utils/types.ts";


export class Writer {
  dest: string;
  destAssets: string;
  createdDirs = new Set<string>();

  constructor(dest: string) {
    this.dest = dest;
    this.destAssets = path.join(this.dest, ASSETS_DIRNAME);
  }

  init() {
    this.createdDirs.clear();
    fs.emptyDirSync(this.dest);
  }

  writeAssets(assets: Asset[]) {
    Deno.mkdirSync(this.destAssets);

    assets.forEach((asset) => {
      const destDir = path.join(this.destAssets, asset.dir);
      if (!this.createdDirs.has(destDir)) {
        Deno.mkdirSync(destDir, { recursive: true });
        this.createdDirs.add(destDir);
      }

      Deno.copyFileSync(
        asset.path,
        path.join(this.destAssets, asset.pathRelative),
      );
    });
  }

  writePages(pages: Page[], renderer: Renderer, siteData: Object) {
    pages.forEach((page) => {
      const destDir = appendName(path.join(this.dest, page.dir), page.name);

      if (!this.createdDirs.has(destDir)) {
        Deno.mkdirSync(destDir, { recursive: true });
        this.createdDirs.add(destDir);
      }

      const generatedHTML = renderer.render(page.layout, {
        page: page.convertToData(),
        site: siteData,
      })

      Deno.writeTextFileSync(path.join(destDir, "index.html"), generatedHTML)
    });
  }
}
