import { Base } from "./base.ts";
import { listDirs } from "../utils/file.ts";
import { dayjs, frontmatter } from "../deps.ts";

export class Page extends Base {
  title: string;
  body: string;
  date: dayjs.Dayjs | null;
  layout: string;
  categories: string[];
  attrs = {};

  constructor(
    baseDir: string,
    pathRelative: string,
    rawContent: string,
    created: Date | null,
  ) {
    super(baseDir, pathRelative);

    this.rawContent = rawContent;
    const parsedFrontmatter = frontmatter
      .extract<PageFrontmatter>(this.rawContent);

    const {
      title,
      layout,
      date,
      categories,
      ...attrs
    } = parsedFrontmatter.attrs;

    this.title = title || this.name;
    this.body = parsedFrontmatter.body;
    this.date = date ? dayjs(date) : (created ? dayjs(created) : null);
    this.layout = layout || "default";
    this.categories = categories || listDirs(this.pathRelative);
    this.attrs = attrs;
  }
}

export interface PageFrontmatter {
  title?: string;
  layout?: string;
  date?: string | Date;
  categories?: string[];
}
