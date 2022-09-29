import { Base } from "./base.ts";
import { listDirs, appendName } from "../utils/file.ts";
import {
  path,
  dayjs,
  frontmatter,
} from "../deps.ts";

export class Page extends Base {
  title: string;
  /** Unprocessed contents of body from markdown */
  body: string;
  date: dayjs.Dayjs | null;
  layout: string;
  categories: string[];
  url: string;
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
      url,
      ...attrs
    } = parsedFrontmatter.attrs;

    this.title = title || this.name;
    this.body = parsedFrontmatter.body;
    this.date = date ? dayjs(date) : (created ? dayjs(created) : null);
    this.layout = layout || "default";
    this.categories = categories || listDirs(this.pathRelative);
    this.url = url || appendName(path.join("/", this.dir), this.name);
    this.attrs = attrs;
  }
}

export interface PageFrontmatter {
  title?: string;
  layout?: string;
  date?: string | Date;
  categories?: string[];
  url?: string;
}
