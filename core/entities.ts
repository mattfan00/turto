import { dayjs } from "../deps.ts";

export interface BaseFile {
  src: string;
  dest: string;
  path: string;
  stat: Deno.FileInfo;

  [index: string]: unknown;
}

export interface Page extends BaseFile {
  content: string;
  /** Contents of the file after parsing out the frontmatter */
  body: string;
  layout?: string;
  categories: string[];
  date: dayjs.Dayjs | null;
}

export interface PageFrontmatter {
  path: string;
  layout: string;
  categories: string[];
  date: Date | string;
}

export interface Asset extends BaseFile {
  content?: Uint8Array;
}
