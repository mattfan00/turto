import { pageExtensions, Site } from "./site.ts";
import { readDirRecursive } from "./utils/file.ts";
import { micromatch, path } from "../deps.ts";

// TODO: move load and render into site, no longer a plugin, and will used in `build`
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

    if (pageExtensions.includes(path.extname(p))) {
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
  const baseData = {
    ...site.data,
    site: {
      pages: site.pages,
      assets: site.assets,
    },
  };

  site.pages.forEach((page) => {
    // TODO: create a renderPage method in Site
    const data = { ...baseData, page: page };

    // first render only the contents of the file
    page.content = site.renderer.runOnDemand(page.content, data);

    // if in a layout, then render with the layout
    if (page.layout) {
      page.content = site.renderer.run(page.layout, {
        ...site.data,
        page: page,
      });
    }
  });
};
