import {
  dayjs,
  frontmatter,
  fs,
  marked,
  micromatch,
  MicromatchOptions,
  path,
} from "../deps.ts";
import {
  appendName,
  listDirs,
  normalizeDir,
  readDirRecursive,
} from "./utils/file.ts";
import { Object } from "./utils/types.ts";
import { Asset, BaseFile, Page, PageFrontmatter } from "./entities.ts";
import { NunjucksConfigureOptions, Renderer } from "./renderer.ts";

export class Site {
  options: SiteOptions;
  pages: Page[] = [];
  assets: Asset[] = [];
  data: Object = {};

  renderer: Renderer;

  #plugins: Plugin[] = [];

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };
    this.#normalizeOptions();

    this.options.ignore.push(
      `${this.options.layouts}/**`,
      `${this.options.dest}/**`,
    );

    this.renderer = new Renderer(this.options.layouts, this.options.renderer);
  }

  #normalizeOptions() {
    this.options.src = normalizeDir(this.options.src);
    this.options.dest = normalizeDir(this.options.dest);
    this.options.layouts = normalizeDir(this.options.layouts);
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

  setData(data: Object) {
    this.data = data;
    return this;
  }

  use(fn: Plugin) {
    this.#plugins.push(fn);
    return this;
  }

  read() {
    const paths = readDirRecursive(this.getSrc());

    paths.forEach((p) => {
      // Ignore "." files
      if (path.basename(p).startsWith(".")) {
        return;
      }

      if (micromatch.isMatch(p, this.options.ignore, this.options.micromatch)) {
        return;
      }

      if (pageExtensions.includes(path.extname(p))) {
        const newPage = this.readPage(p);
        this.pages.push(newPage);
      } else {
        const newAsset = this.readAsset(p);
        this.assets.push(newAsset);
      }
    });

    const layoutPaths = readDirRecursive(
      path.join(this.getSrc(), this.options.layouts),
    );

    layoutPaths.forEach((p) => {
      const content = Deno.readTextFileSync(
        path.join(this.getSrc(), this.options.layouts, p),
      );

      this.renderer.compile(p, content);
    });
  }

  readPage(pathRelative: string): Page {
    if (!pageExtensions.includes(path.extname(pathRelative))) {
      throw new Error(`Page must use a valid extension`);
    }

    const baseFile = this.#readBaseFile(pathRelative);
    const fileContent = Deno.readTextFileSync(
      path.join(this.getSrc(), pathRelative),
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

    const { dir, name, ext } = path.parse(pathRelative);

    // if contents is markdown, then convert it to HTML
    const content = ext === ".md" ? marked.parse(body) : body;

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
          this.options.micromatch,
        )
        : false;
    }
    const baseFile = this.#readBaseFile(pathRelative);
    const content = getContent
      ? Deno.readFileSync(path.join(this.getSrc(), pathRelative))
      : undefined;

    const asset: Asset = {
      ...baseFile,
      content: content,
    };

    return asset;
  }

  #readBaseFile(pathRelative: string): BaseFile {
    const stat = Deno.statSync(path.join(this.getSrc(), pathRelative));
    return {
      src: pathRelative,
      dest: pathRelative,
      path: path.join("/", pathRelative),
      stat: stat,
    };
  }

  render() {
    const baseData = {
      ...this.data,
      site: {
        pages: this.pages,
        assets: this.assets,
      },
    };

    this.pages.forEach((page) => {
      this.renderPage(page, {
        ...baseData,
        page: page,
      });
    });
  }

  // deno-lint-ignore ban-types
  renderPage(page: Page, data: object) {
    // first render only the contents of the file
    page.content = this.renderer.runOnDemand(page.content, data);

    // if in a layout, then render with the layout
    if (page.layout) {
      page.content = this.renderer.run(page.layout, data);
    }
  }

  processPlugins() {
    this.#plugins.forEach(async (plugin) => {
      await plugin(this);
    });
  }

  write() {
    this.pages.forEach((page) => {
      this.writePage(page);
    });

    this.assets.forEach((asset) => {
      this.writeAsset(asset);
    });
  }

  writePage(page: Page) {
    this.#makeDir(page.dest);

    Deno.writeTextFileSync(
      path.join(this.getDest(), page.dest),
      page.content,
    );
  }

  writeAsset(asset: Asset) {
    this.#makeDir(asset.dest);

    const dest = path.join(this.getDest(), asset.dest);
    if (asset.content !== undefined) {
      Deno.writeFileSync(dest, asset.content);
    } else {
      Deno.copyFileSync(path.join(this.getSrc(), asset.src), dest);
    }
  }

  #makeDir(dest: string) {
    Deno.mkdirSync(path.join(this.getDest(), path.dirname(dest)), {
      recursive: true,
    });
  }

  init() {
    fs.emptyDirSync(this.getDest());
  }

  build() {
    this.init();
    this.read();
    this.render();
    this.processPlugins();
    this.write();
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
  /** Options for renderer, currently only uses nunjucks options */
  renderer: NunjucksConfigureOptions;
  /** Convert "dir/hello.html" to "dir/hello/index.html" */
  prettyPaths: boolean;
  /** Ignore files when using `load`, uses `micromatch` */
  ignore: string[];
  /** Specifies which assets to read the content for */
  readAssetContent: string[];
  /** Options for when `micromatch` is used */
  micromatch: MicromatchOptions;
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: ".",
  dest: "_site",
  layouts: "_layouts",
  renderer: {},
  prettyPaths: true,
  ignore: [],
  readAssetContent: [],
  micromatch: {
    basename: true,
  },
};

export const pageExtensions = [
  ".md",
  ".html",
  ".njk",
];
