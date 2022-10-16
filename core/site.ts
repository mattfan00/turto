import { dayjs, frontmatter, marked, micromatch, path } from "../deps.ts";
import { listDirs, readDirRecursive } from "./utils/file.ts";
import { Asset, BaseFile, Page, PageFrontmatter } from "./entities.ts";
import { Renderer } from "./renderer.ts";

export class Site {
  options: SiteOptions;
  pages: Page[] = [];
  assets: Asset[] = [];

  renderer: Renderer;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };

    this.renderer = new Renderer();
  }

  load() {
    const paths = readDirRecursive(this.getSrc())
      .filter((p) => !micromatch.isMatch(p, this.options.ignore));
  }

  loadPage(pathRelative: string) {
    const baseFile = this.#loadBaseFile(pathRelative);
    const fileContent = Deno.readTextFileSync(
      path.join(this.getBase(), pathRelative),
    );

    let pageData = {} as Partial<PageFrontmatter>;
    let body = fileContent;
    if (frontmatter.test(fileContent)) {
      const parsedFrontmatter = frontmatter
        .extract<Partial<PageFrontmatter>>(fileContent);

      pageData = parsedFrontmatter.attrs;
      body = parsedFrontmatter.body;
    }

    const {
      path: frontmatterPath,
      layout,
      categories,
      date,
      ...attrs
    } = pageData;

    const content = marked.parse(body);
    let finalPath = frontmatterPath;
    if (!finalPath) {
      const { dir, name } = path.parse(pathRelative);
      finalPath = path.join("/", dir, name + ".html");
    }

    const page: Page = {
      ...baseFile,
      path: frontmatterPath || finalPath,
      content: content,
      layout: layout,
      categories: categories || listDirs(pathRelative),
      date: date
        ? dayjs(date)
        : (baseFile.stat.birthtime ? dayjs(baseFile.stat.birthtime) : null),
      ...attrs,
    };

    this.pages.push(page);
  }

  loadAsset(pathRelative: string, getContent = false) {
    const baseFile = this.#loadBaseFile(pathRelative);
    const content = getContent
      ? Deno.readFileSync(path.join(this.getBase(), pathRelative))
      : undefined;

    const asset: Asset = {
      ...baseFile,
      content: content,
    };

    this.assets.push(asset);
  }

  loadLayout(pathRelative: string) {
    const content = Deno.readTextFileSync(
      path.join(this.getBase(), this.options.layouts, pathRelative),
    );

    this.renderer.compile(pathRelative, content);
  }

  get layouts() {
    return [...this.renderer.cache.keys()];
  }

  #loadBaseFile(pathRelative: string): BaseFile {
    const stat = Deno.statSync(path.join(this.getBase(), pathRelative));
    return {
      src: pathRelative,
      dest: pathRelative,
      path: path.join("/", pathRelative),
      stat: stat,
    };
  }

  build() {}

  getBase() {
    return this.options.base;
  }

  getSrc() {
    return path.join(this.options.base, this.options.src);
  }

  getDest() {
    return path.join(this.options.base, this.options.dest);
  }
}

export interface SiteOptions {
  /** Current working directory */
  base: string;
  /** Directory relative to `base` where files are located */
  src: string;
  /** Directory relative to `base` where site will be generated */
  dest: string;
  /** Directory relative to `src` where layouts are located */
  layouts: string;
  ignore: string[];
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: "./",
  dest: "./_site",
  layouts: "_layouts",
  ignore: [],
};
