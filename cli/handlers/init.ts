import { fs } from "../../deps.ts";

export const initHandler = (dirname: string) => {
  if (dirname) {
    fs.ensureDirSync(dirname);
  }
};
