import {
  dayjs,
  frontmatter,
  fs,
  marked,
  micromatch,
  MicromatchOptions,
  path,
} from "../deps.ts";
import { appendName, listDirs } from "./utils/file.ts";
import { Object } from "./utils/types.ts";
import { Asset, BaseFile, Page, PageFrontmatter } from "./entities.ts";
import { Renderer } from "./renderer.ts";
import * as plugins from "./plugins.ts";

export class Site {
  options: SiteOptions;
  pages: Page[] = [];
  assets: Asset[] = [];
  data: Object = {};

  renderer: Renderer;

  #plugins: Plugin[] = [];

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };

    this.renderer = new Renderer();
  }

  addLayoutFilter(
    name: string,
    // deno-lint-ignore no-explicit-any
    func: (...args: any[]) => any,
    async?: boolean,
  ) {
    this.renderer.engine.addFilter(name, func, async);
  }

  getBase() {
    return this.options.base;
  }

  getSrc() {
    return path.join(this.options.base, this.options.src);
  }

  getDest() {
    return path.join(this.options.base, this.options.dest);
  }

  getLayoutsDir() {
    return path.normalize(this.options.layouts);
  }

  get layouts() {
    return [...this.renderer.cache.keys()];
  }

  setData(data: Object) {
    this.data = data;
    return this;
  }

  use(fn: Plugin) {
    this.#plugins.push(fn);
    return this;
  }

  load() {
    return this.use(plugins.load);
  }

  render() {
    return this.use(plugins.render);
  }

  readPage(pathRelative: string): Page {
    const baseFile = this.#readBaseFile(pathRelative);
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

    const { dir, name } = path.parse(pathRelative);
    let dest: string;
    let genPath: string;
    if (this.options.prettyPaths) {
      dest = path.join(appendName(dir, name), "index.html");
      genPath = appendName(path.join("/", dir), name);
    } else {
      dest = path.join(dir, name + ".html");
      genPath = path.join("/", dest);
    }

    const page: Page = {
      ...baseFile,
      dest: dest,
      path: frontmatterPath || genPath,
      content: content,
      body: body,
      layout: layout,
      categories: categories || listDirs(pathRelative),
      date: date
        ? dayjs(date)
        : (baseFile.stat.birthtime ? dayjs(baseFile.stat.birthtime) : null),
      ...attrs,
    };

    return page;
  }

  readAsset(pathRelative: string, getContent?: boolean): Asset {
    if (getContent === undefined) {
      getContent = this.options.readAssetContent
        ? micromatch.isMatch(
          pathRelative,
          this.options.readAssetContent,
          this.options.micromatchOptions,
        )
        : false;
    }
    const baseFile = this.#readBaseFile(pathRelative);
    const content = getContent
      ? Deno.readFileSync(path.join(this.getBase(), pathRelative))
      : undefined;

    const asset: Asset = {
      ...baseFile,
      content: content,
    };

    return asset;
  }

  #readBaseFile(pathRelative: string): BaseFile {
    const stat = Deno.statSync(path.join(this.getBase(), pathRelative));
    return {
      src: pathRelative,
      dest: pathRelative,
      path: path.join("/", pathRelative),
      stat: stat,
    };
  }

  build() {
    fs.emptyDirSync(this.getDest());

    this.#plugins.forEach(async (plugin) => {
      await plugin(this);
    });

    this.pages.forEach((page) => {
      this.#makeDir(page.dest);

      Deno.writeTextFileSync(
        path.join(this.getDest(), page.dest),
        page.content,
      );
    });

    this.assets.forEach((asset) => {
      this.#makeDir(asset.dest);

      const dest = path.join(this.getDest(), asset.dest);
      if (asset.content !== undefined) {
        Deno.writeFileSync(dest, asset.content);
      } else {
        Deno.copyFileSync(path.join(this.getSrc(), asset.src), dest);
      }
    });
  }

  #makeDir(dest: string) {
    Deno.mkdirSync(path.join(this.getDest(), path.dirname(dest)), {
      recursive: true,
    });
  }
}

export type Plugin = (site: Site) => Promise<void> | void;

export interface SiteOptions {
  /** Current working directory */
  base: string;
  /** Directory relative to `base` where files are located */
  src: string;
  /** Directory relative to `base` where site will be generated */
  dest: string;
  /** Directory relative to `src` where layouts are located */
  layouts: string;
  /** Convert "dir/hello.html" to "dir/hello/index.html" */
  prettyPaths: boolean;
  /** Ignore files when using `load`, uses `micromatch` */
  ignore: string[];
  /** Specifies which assets to read the content for */
  readAssetContent: string[];
  /** Options for when `micromatch` is used */
  micromatchOptions: MicromatchOptions;
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: "./",
  dest: "./_site",
  layouts: "_layouts",
  prettyPaths: true,
  ignore: [],
  readAssetContent: [],
  micromatchOptions: {
    basename: true,
  },
};
