import { Buffer, copy, fs, gunzip, path, Untar } from "../../deps.ts";
import { isUrl, styles, trimPrefix } from "../utils.ts";

interface InitOptions {
  template: string;
}

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

  const baseDir = path.join(Deno.cwd(), dirname || "");
  console.log(`Creating a new turto project in ${styles.file(baseDir)}`);

  if (!isUrl(options.template)) {
    const downloadUrl =
      "https://codeload.github.com/mattfan00/turto/tar.gz/main";
    const res = await fetch(downloadUrl);

    const body = await res.arrayBuffer();
    // uncompress tar.gz file to get tar file
    const tarData = gunzip(new Uint8Array(body));
    const untar = new Untar(new Buffer(tarData));
    console.log("\nSuccessfully downloaded template\n");

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
  }

  console.log("\nSuccess!");

  // TODO: add in remote templates
};
