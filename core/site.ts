import { Page } from "./entities/page.ts";
import { Asset } from "./entities/asset.ts";
import { Layout } from "./entities/layout.ts";

import { Renderer } from "./renderer.ts";

import { AssetReader } from "./readers/asset-reader.ts";
import { PageReader } from "./readers/page-reader.ts";
import { LayoutReader } from "./readers/layout-reader.ts";

export class Site {
  options: SiteOptions;

  pages: Page[] = [];
  assets: Asset[] = [];
  layouts: Layout[] = [];

  assetReader: AssetReader;
  pageReader: PageReader;
  layoutReader: LayoutReader;

  renderer: Renderer;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };

    this.renderer = new Renderer();

    this.assetReader = new AssetReader(this.options.src);
    this.pageReader = new PageReader(this.options.src);
    this.layoutReader = new LayoutReader(this.options.src, this.renderer);
  }

  generate() {
    this.read();
  }

  read() {
    this.assets = this.assetReader.read();
    this.pages = this.pageReader.read();
    this.layouts = this.layoutReader.read();
  }
}

export interface SiteOptions {
  /** Base directory where files are located */
  src: string;
  /** Directory where site will be generated */
  dest: string;
}

const defaultSiteOptions: SiteOptions = {
  src: "./",
  dest: "./public",
};
