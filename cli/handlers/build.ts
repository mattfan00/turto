import { runMod } from "../utils.ts";

export const buildHandler = async () => {
  await runMod(Deno.cwd());
};
