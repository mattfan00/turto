import { dayjs, nunjucks } from "../deps.ts";

export class Renderer {
  engine: nunjucks.Environment;
  cache: Map<string, nunjucks.Template>;

  constructor() {
    this.engine = nunjucks.configure({ autoescape: false });
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
    return nunjucks.renderString(content, data);
  }
}

const formatDate = (date: dayjs.Dayjs, formatStr: string) => {
  return date.format(formatStr);
};
