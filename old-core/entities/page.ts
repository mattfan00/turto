import { Base, Convertible, RawContent } from "./base.ts";
import { dayjs } from "../../deps.ts";

export class Page extends Base implements Convertible, RawContent {
  rawContent: string;
  /** Unconverted contents of body from markdown */
  body = "";
  /** Converted body from markdown to HTML */
  content = "";
  data: PageData = {};

  constructor(
    baseDir: string,
    pathRelative: string,
    rawContent: string,
  ) {
    super(baseDir, pathRelative);
    this.rawContent = rawContent;
  }

  convertToData() {
    return {
      ...this.data,
      content: this.content,
    };
  }
}

export interface PageData {
  title?: string;
  layout?: string;
  date?: dayjs.Dayjs | null;
  categories?: string[];
  url?: string;
  // deno-lint-ignore ban-types
  attrs?: {};
}

export interface PageFrontmatter {
  title: string;
  layout: string;
  date: string | Date;
  categories: string[];
  url: string;
}
