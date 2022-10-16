import { dayjs, frontmatter, micromatch, path } from "../deps.ts";
import { listDirs, readDirRecursive } from "./utils/file.ts";
import { Asset, BaseFile, Page, PageFrontmatter } from "./entities.ts";

export class Site {
  options: SiteOptions;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };
  }

  load() {
    const paths = readDirRecursive(this.getSrc())
      .filter((p) => !micromatch.isMatch(p, this.options.ignore));
  }

  loadPage(pathRelative: string): Page {
    const baseFile = this.#loadBaseFile(pathRelative);
    const content = Deno.readTextFileSync(
      path.join(this.getBase(), pathRelative),
    );

    let pageData = {} as Partial<PageFrontmatter>;
    if (frontmatter.test(content)) {
      const parsedFrontmatter = frontmatter
        .extract<Partial<PageFrontmatter>>(content);

      pageData = parsedFrontmatter.attrs;
    }

    const {
      path: p,
      layout,
      categories,
      date,
      ...attrs
    } = pageData;

    return {
      ...baseFile,
      path: p || baseFile.path,
      content: content,
      layout: layout,
      categories: categories || listDirs(pathRelative),
      date: date
        ? dayjs(date)
        : (baseFile.stat.birthtime ? dayjs(baseFile.stat.birthtime) : null),
      ...attrs,
    };
  }

  loadAsset(pathRelative: string, getContent: boolean): Asset {
    const baseFile = this.#loadBaseFile(pathRelative);
    const content = getContent
      ? Deno.readFileSync(path.join(this.getBase(), pathRelative))
      : undefined;
    return {
      ...baseFile,
      content: content,
    };
  }

  loadLayout(pathRelative: string) {
    const content = Deno.readTextFileSync(
      path.join(this.getBase(), pathRelative),
    );
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
  /** Directory relative to base where files are located */
  src: string;
  /** Directory relative to base where site will be generated */
  dest: string;
  ignore: string[];
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: "./",
  dest: "./_site",
  ignore: [],
};
