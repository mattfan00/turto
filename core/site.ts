import { Page } from "./entities/page.ts";
import { Asset } from "./entities/asset.ts";
import { Layout } from "./entities/layout.ts";

import { Renderer } from "./renderer.ts";

import { AssetReader } from "./readers/asset-reader.ts";

export class Site {
  options: SiteOptions;

  pages: Page[] = [];
  assets: Asset[] = [];
  layouts: Layout[] = [];

  assetReader: AssetReader;

  renderer: Renderer;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };

    this.assetReader = new AssetReader(this.options.src);

    this.renderer = new Renderer();
  }

  generate() {
    this.read();
  }

  read() {
    this.assets = this.assetReader.read();
  }
}

export interface SiteOptions {
  /** Base directory to read from */
  src: string;
  /** Directory where site will be generated */
  dest: string;
}

const defaultSiteOptions: SiteOptions = {
  src: "./",
  dest: "./public",
};
