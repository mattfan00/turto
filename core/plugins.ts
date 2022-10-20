import { Site } from "./site.ts";
import { readDirRecursive } from "./utils/file.ts";
import { micromatch, path } from "../deps.ts";

export const load = (site: Site) => {
  const paths = readDirRecursive(site.getSrc())
    .filter((p) =>
      !micromatch.isMatch(
        p,
        site.options.ignore,
        site.options.micromatchOptions,
      ) &&
      !p.startsWith(site.getLayoutsDir())
    );

  paths.forEach((p) => {
    // Ignore "." files
    if (path.basename(p).startsWith(".")) {
      return;
    }

    const ext = path.extname(p);

    if (ext === ".md") {
      const newPage = site.readPage(p);
      site.pages.push(newPage);
    } else {
      const newAsset = site.readAsset(p);
      site.assets.push(newAsset);
    }
  });

  const layoutPaths = readDirRecursive(
    path.join(site.getSrc(), site.getLayoutsDir()),
  );

  layoutPaths.forEach((p) => {
    const content = Deno.readTextFileSync(
      path.join(site.getBase(), site.options.layouts, p),
    );

    site.renderer.compile(p, content);
  });
};

export const render = (site: Site) => {
  site.pages.forEach((page) => {
    if (page.layout) {
      const generatedHtml = site.renderer.run(page.layout, {
        ...site.data,
        site: {
          pages: site.pages,
          assets: site.assets,
        },
        page: page,
      });
      page.content = generatedHtml;
    }
  });
};
