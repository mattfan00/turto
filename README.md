# turto

An SSG built with Deno (meant for personal use). Sort of like a more opinionated version of Metalsmith.js

## setup

1. Install the turto CLI: `deno install --allow-env --allow-read --allow-run --allow-net https://deno.land/x/turto/cli.ts`.
1. Create a new turto project using the default template: `turto init`.
1. Build your site: `turto build`.

## commands

Use the `--help` flag to get more details for each command.

- `init` - create a new turto project
- `build` - build your site
  - essentially runs `deno run -A mod.ts`
- `dev` - (not complete) build your application in development mode (file watcher server, etc.)


## concepts

Each file in your source directory is either a page, asset, or layout.

### page
- contents of your website.
- any file with the extensions `.md`, `.html`, `.njk` are recognized as pages.
- files can contain markdown to specify data about the page.

### asset
- any file that is not a page or a layout
- by default, turto will not read the contents of an asset file into memory and you will need to specify which files to read using the `readAssetContent` option

### layout
- all layouts live in a special directory specified in the options.
- pages can specify a layout to use by specifiying the `layout` field in its markdown.


## api

Each turto project should have a `mod.ts` file which will build your site when run. Here is the most basic structure:
```ts
import { turto } from "https://deno.land/x/turto/mod.ts";

const site = turto();
site.build();
```

#### `turto(options: SiteOptions)`
Returns a `Site` object initialized with `options`.

`SiteOptions`
- `src` - source directory where all files are located (default: ".")
- `dest` - directory relative to `src` where site will be generated (default: "_site")
- `layouts` - directory relative to `src` where layouts are located (default: "_layouts")
- `renderer` - options for renderer, currently only uses nunjucks options (default: {})
- `prettyPaths` - convert "dir/hello.html" to "dir/hello/index.html" (default: false)
- `ignore` - ignore files when using `load`, uses `micromatch` (default: [])
- `readAssetContent` - specifies which assets to read the content for (default: [])
- `micromatch` - options for when `micromatch` is used (default: {})

### `Site`
- `build()` - builds your site
  1. reads in all the pages, assets, and layouts in the source directory
  1. render the page contents if the page has a specified layout
  1. runs through all of the plugins (plugins will execute in the order they are added)
  1. writes the contents into the source directory
- `use(fn: Plugin)` - add a plugin