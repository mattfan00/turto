import { Reader } from "./reader.ts";
import { appendName, listDirs, readDirRecursive } from "../utils/file.ts";
import { PAGES_DIRNAME } from "../utils/constants.ts";
import { Page, PageFrontmatter } from "../entities/page.ts";
import { dayjs, frontmatter, path } from "../deps.ts";
import { MarkdownConverter } from "../engines/markdown-converter.ts";

export class PageReader extends Reader {
  markdownConverter: MarkdownConverter;

  constructor(src: string, markdownConverter: MarkdownConverter) {
    super(src, PAGES_DIRNAME);
    this.markdownConverter = markdownConverter;
  }

  read() {
    return readDirRecursive(this.dir)
      .map((pathRelative) => {
        const fullPath = path.join(this.dir, pathRelative);
        const fileInfo = Deno.statSync(fullPath);
        const rawContent = Deno.readTextFileSync(fullPath);

        const page = new Page(
          this.dir,
          pathRelative,
          rawContent,
        );

        const parsedFrontmatter = frontmatter
          .extract<PageFrontmatter>(page.rawContent);

        const {
          title,
          layout,
          date,
          categories,
          url,
          ...attrs
        } = parsedFrontmatter.attrs;

        page.body = parsedFrontmatter.body;
        page.data = {
          title: title || page.name,
          date: date
            ? dayjs(date)
            : (fileInfo.birthtime ? dayjs(fileInfo.birthtime) : null),
          layout: layout || "default",
          categories: categories || listDirs(page.pathRelative),
          url: url || appendName(path.join("/", page.dir), page.name),
          attrs: attrs,
        };
        page.content = this.markdownConverter.run(page.body);

        return page;
      });
  }
}
