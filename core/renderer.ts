import { nunjucks, dayjs } from "./deps.ts";

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
}

const formatDate = (date: dayjs.Dayjs, formatStr: string) => {
  return date.format(formatStr);
}