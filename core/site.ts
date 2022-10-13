export class Site {
  options: SiteOptions;

  constructor(options?: Partial<SiteOptions>) {
    this.options = { ...defaultSiteOptions, ...options };
  }

  build() {}
}

export interface SiteOptions {
  /** Current working directory */
  base: string;
  /** Directory relative to base where files are located */
  src: string;
  /** Directory relative to base where site will be generated */
  dest: string;
}

const defaultSiteOptions: SiteOptions = {
  base: Deno.cwd(),
  src: "./",
  dest: "./public",
};
