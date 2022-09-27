import { fs, path } from "./deps.ts";
import { Asset } from "./entities/asset.ts";
import { ASSETS_DIRNAME, PAGES_DIRNAME } from "./utils/constants.ts";

export class Writer {
  dest: string;
  destAssets: string;
  destPages: string;

  constructor(dest: string) {
    this.dest = dest;
    this.destAssets = path.join(this.dest, ASSETS_DIRNAME);
    this.destPages = path.join(this.dest, PAGES_DIRNAME);
  }

  initDest() {
    fs.emptyDirSync(this.dest);
    Deno.mkdirSync(this.destAssets);
  }

  copyAssets(assets: Asset[]) {
    const createdDirs = new Set<string>();

    assets.forEach((asset) => {
      const newDir = path.join(this.destAssets, asset.dir);
      if (!createdDirs.has(newDir)) {
        Deno.mkdirSync(newDir, { recursive: true });
        createdDirs.add(newDir);
      }

      Deno.copyFileSync(
        asset.path,
        path.join(this.destAssets, asset.pathRelative),
      );
    });
  }
}
