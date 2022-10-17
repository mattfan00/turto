import { path } from "../deps.ts";

import { Convertible } from "./entities/base.ts";
import { Page } from "./entities/page.ts";
import { Asset } from "./entities/asset.ts";
import { Layout } from "./entities/layout.ts";

import { Renderer } from "./engines/renderer.ts";
import { MarkdownConverter } from "./engines/markdown-converter.ts";
import { Writer } from "./writer.ts";

import { AssetReader } from "./readers/asset-reader.ts";
import { PageReader } from "./readers/page-reader.ts";
import { LayoutReader } from "./readers/layout-reader.ts";

export class Site implements Convertible {
  options: SiteOptions;

  pages: Page[] = [];
  assets: Asset[] = [];
  layouts: Layout[] = [];

  assetReader: AssetReader;
  pageReader: PageReader;
  layoutReader: LayoutReader;

  renderer: Renderer;
  markdownConverter: MarkdownConverter;
  writer: Writer;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };

    this.renderer = new Renderer();
    this.markdownConverter = new MarkdownConverter();
    this.writer = new Writer(this.getDest());

    this.assetReader = new AssetReader(this.getSrc());
    this.pageReader = new PageReader(this.getSrc(), this.markdownConverter);
    this.layoutReader = new LayoutReader(this.getSrc(), this.renderer);
  }

  build() {
    this.writer.init();
    this.read();
    this.write();
  }

  read() {
    this.assets = this.assetReader.read();
    this.pages = this.pageReader.read();
    this.layouts = this.layoutReader.read();
  }

  write() {
    this.writer.writeAssets(this.assets);
    this.writer.writePages(this.pages, this.renderer, this.convertToData());
  }

  getSrc() {
    return path.join(this.options.base, this.options.src);
  }

  getDest() {
    return path.join(this.options.base, this.options.dest);
  }

  convertToData() {
    const convertedPages = [...this.pages]
      .sort((a, b) => {
        const bTime = b.data.date ? b.data.date.unix() : 0;
        const aTime = a.data.date ? a.data.date.unix() : 0;

        return bTime - aTime;
      })
      .map((page) => page.convertToData());

    const convertedAssets = [...this.assets].map((asset) =>
      asset.convertToData()
    );

    return {
      pages: convertedPages,
      assets: convertedAssets,
    };
  }
}

export interface SiteOptions {
  /** Current working directory */
  base: string;
  /** Directory relative to base where files are located */
  src: string;
  /** Directory relative to base where site will be generated */
  dest: string;
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: "./",
  dest: "./public",
};