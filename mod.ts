import { Site, SiteOptions } from "./core/site.ts";

export const turto = (options: SiteOptions) => {
  return new Site(options);
};
