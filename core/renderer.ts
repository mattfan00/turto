import {
  dayjs,
  nunjucks,
  NunjucksEnvironment,
  NunjucksTemplate,
} from "../deps.ts";

export class Renderer {
  engine: NunjucksEnvironment;
  cache: Map<string, NunjucksTemplate>;

  constructor(src: string, options: NunjucksConfigureOptions) {
    this.engine = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(src),
      options,
    );
    this.cache = new Map();

    this.engine.addFilter("formatdate", formatDate);
  }

  /** Compiles layout and stores it in the cache */
  compile(layoutName: string, content: string) {
    if (!this.cache.get(layoutName)) {
      this.cache.set(layoutName, nunjucks.compile(content, this.engine));
    }
  }

  run(
    layoutName: string,
    // deno-lint-ignore ban-types
    data?: object,
  ) {
    const template = this.cache.get(layoutName);
    if (!template) {
      throw new Error(`"${layoutName}" layout does not exist`);
    }

    return template.render(data);
  }

  /** run without using compiled template */
  runOnDemand(
    content: string,
    // deno-lint-ignore ban-types
    data: object,
  ) {
    return this.engine.renderString(content, data);
  }
}

const formatDate = (date: dayjs.Dayjs, formatStr: string) => {
  return date.format(formatStr);
};

export interface NunjucksConfigureOptions {
  autoescape?: boolean;
  throwOnUndefined?: boolean;
  trimBlocks?: boolean;
  lstripBlocks?: boolean;
  watch?: boolean;
  noCache?: boolean;
  tags?: {
    blockStart?: string;
    blockEnd?: string;
    variableStart?: string;
    variableEnd?: string;
    commentStart?: string;
    commentEnd?: string;
  };
}
