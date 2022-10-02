import { Site, SiteOptions } from "./core/site.ts";

export const turto = (options?: Partial<SiteOptions>) => {
  return new Site(options);
};
