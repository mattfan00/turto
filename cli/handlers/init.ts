import { dayjs, fs, path } from "../../deps.ts";
import {
  ASSETS_DIRNAME,
  LAYOUTS_DIRNAME,
  PAGES_DIRNAME,
} from "../../core/utils/constants.ts";
import { styles } from "../utils.ts";

export const initHandler = (dirname?: string) => {
  if (dirname) {
    try {
      Deno.statSync(dirname);
      throw new Error(
        `The ${
          styles.file(dirname)
        } directory already exists. Try using a new directory name or remove the existing one.`,
      );
    } catch (error) {
      // only throw error if the error did not occur due to directory not existing
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  const baseDir = dirname || ".";

  const currentDate = dayjs();

  // create necessary directories and files
  fs.ensureDirSync(baseDir);

  const assetsDir = path.join(baseDir, ASSETS_DIRNAME);
  Deno.mkdirSync(assetsDir);
  Deno.writeTextFileSync(path.join(assetsDir, "index.css"), defaultCssText);

  const pagesDir = path.join(baseDir, PAGES_DIRNAME);
  Deno.mkdirSync(pagesDir);
  Deno.writeTextFileSync(
    path.join(pagesDir, "index.md"),
    defaultPageText(
      {
        title: "My home page",
        date: currentDate,
        layout: "home",
      },
      "Welcome to my home page!",
    ),
  );

  const postsDir = path.join(pagesDir, "posts");
  Deno.mkdirSync(postsDir);
  Deno.writeTextFileSync(
    path.join(postsDir, "first-post.md"),
    defaultPageText(
      {
        title: "First Post",
        date: currentDate,
      },
      "This is my first post that has a lot of interesting content.",
    ),
  );

  const layoutsDir = path.join(baseDir, LAYOUTS_DIRNAME);
  Deno.mkdirSync(layoutsDir);
  Deno.writeTextFileSync(
    path.join(layoutsDir, "default.html"),
    defaultLayoutText(`<div class="title">
        <h2>{{ page.title }}</h2>
        <div>{{ page.date | formatdate("MMM D, YYYY") }}</div>
      </div>
      {{ page.content }}`),
  );
  Deno.writeTextFileSync(
    path.join(layoutsDir, "home.html"),
    defaultLayoutText(`<h2>{{ page.title }}</h2>
      {{ page.content }}
      {% for page in site.pages %}
      {% if "posts" in page.categories %}
      <a href="{{ page.url }}">
        <div>{{ page.title }}</div>
      </a>
      {% endif %}
      {% endfor %}`),
  );

  console.log("Initialized project!");
};

const defaultCssText = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 15px 25px;
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
}

.main {
  min-width: 750px;
}

.title {
  margin-bottom: 3em;
}

.title h2 {
  margin-bottom: 0.5em;
}
`;

interface DefaultPageOptions {
  title?: string;
  date?: dayjs.Dayjs;
  layout?: string;
}

const defaultPageText = (options: DefaultPageOptions, content: string) => {
  const yamlOptions = [];
  if (options.title) {
    yamlOptions.push(`title: ${options.title}`);
  }
  if (options.date) {
    yamlOptions.push(`date: ${options.date.startOf("hour").format()}`);
  }
  if (options.layout) {
    yamlOptions.push(`layout: ${options.layout}`);
  }

  const yaml = yamlOptions.join("\n");

  return (`---

${yaml}

---

${content}
`);
};

const defaultLayoutText = (content: string) => {
  return (`
<!DOCTYPE html>
<html>
  <head>
    <title>{{ page.title }}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
    <div class="main">
      ${content}
    </div>
  </body>
</html>
`);
};
