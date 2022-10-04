import { turto } from "../../mod.ts";

interface BuildOptions {
  src?: string;
  dest?: string;
}

export const buildHandler = (options: BuildOptions) => {
  const site = turto(options);

  site.build();
};
