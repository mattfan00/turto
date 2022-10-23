import { Buffer, copy, fs, gunzip, path, Untar } from "../../deps.ts";
import { getFileInfo, isUrl, styles, trimPrefix } from "../utils.ts";

interface InitOptions {
  template: string;
}

const REPO_OWNER = "mattfan00";
const REPO_NAME = "turto";

export const initHandler = async (
  dirname: string | undefined,
  options: InitOptions,
) => {
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

  const baseDir = path.resolve(dirname || "");
  console.log(`Creating a new turto project in ${styles.file(baseDir)}`);

  if (!isUrl(options.template)) {
    const templates = await getOfficialTemplates();
    if (!templates.includes(options.template)) {
      const templatesStr = templates
        .map((template) => `"${template}"`)
        .join(", ");
      throw new Error(
        `"${options.template}" is an invalid template, please choose from the following: ${templatesStr}`,
      );
    }

    const downloadUrl =
      `https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/main`;
    const res = await fetch(downloadUrl);

    const body = await res.arrayBuffer();
    // uncompress tar.gz file to get tar file
    const tarData = gunzip(new Uint8Array(body));
    const untar = new Untar(new Buffer(tarData));
    console.log(`\nSuccessfully downloaded template "${options.template}"\n`);

    const prefix = `turto-main/templates/${options.template}`;

    await fs.ensureDir(baseDir);

    for await (const entry of untar) {
      if (entry.fileName.startsWith(prefix)) {
        const destPath = path.join(baseDir, trimPrefix(entry.fileName, prefix));
        if (entry.type === "directory") {
          await fs.ensureDir(destPath);
          continue;
        }
        const file = await Deno.open(destPath, { write: true, create: true });
        await copy(entry, file);
        console.log(`Created new file ${styles.file(destPath)}`);
        file.close();
      }
    }

    // generate default mod.ts file if template doesn't come with it
    const modPath = path.join(baseDir, "./mod.ts");
    if (!getFileInfo(modPath)) {
      const turtoImport = import.meta.resolve("../../mod.ts");
      let modStr = `import { turto } from "${turtoImport}"\n\n`;
      modStr += "const site = turto()\n\n";
      modStr += "site\n";
      modStr += "\t.load()\n";
      modStr += "\t.render()\n";
      modStr += "\t.build()\n";

      Deno.writeTextFileSync(modPath, modStr);
      console.log(`Created default mod.ts file ${styles.file(modPath)}`);
    }

    console.log("\nSuccess!");
  } else {
    // TODO: add in remote templates
    throw new Error(
      "Remote templates are not available right now, please provide an official template name",
    );
  }
};

const getOfficialTemplates = async () => {
  const repoUrl =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/templates`;
  const res = await fetch(repoUrl);
  if (res.status !== 200) {
    throw new Error(`Error fetching from ${styles.link(repoUrl)}`);
  }

  const json = await res.json() as { name: string; type: string }[];
  const officialTemplateNames = json
    .filter((template) => template.type === "dir")
    .map((template) => template.name);
  return officialTemplateNames;
};
