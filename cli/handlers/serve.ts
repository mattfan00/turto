import { http, path, serveFile } from "../../deps.ts";
import { turto } from "../../mod.ts";
import { getFileInfo } from "../utils.ts";
import { BuildOptions } from "./build.ts";

interface ServeOptions extends BuildOptions {
  port: number;
}

export const serveHandler = async (options: ServeOptions) => {
  const site = turto(options);
  site.build();

  const listener = Deno.listen({ port: options.port });
  console.log(`Started server on port ${options.port}\n`);

  await http.serveListener(listener, async (req) => {
    const ctx: Context = { req, baseDir: site.getDest() };
    return await logWrapper(ctx, serve);
  });
};

interface Context {
  req: Request;
  baseDir: string;
}

type Middleware = (ctx: Context, ...next: Middleware[]) => Promise<Response>;

const serve: Middleware = async (ctx: Context) => {
  if (ctx.req.method !== "GET") {
    return new Response(null, { status: 405 });
  }

  const decodedUrl = decodeURI(ctx.req.url);
  const url = new URL(decodedUrl);

  const baseFilePath = path.join(ctx.baseDir, url.pathname);
  const baseFile = getFileInfo(baseFilePath);

  if (!baseFile) {
    return new Response("Not found", { status: 404 });
  }

  if (baseFile.isFile) {
    return await serveFile(ctx.req, baseFilePath, { fileInfo: baseFile });
  }

  // if directory then check if it contains an "index.html" file
  const htmlFilePath =
    (baseFilePath.endsWith("/") ? baseFilePath : baseFilePath + "/") +
    "index.html";
  const htmlFile = getFileInfo(htmlFilePath);

  // if no "index.html" file, then return 404
  if (!htmlFile) {
    return new Response("Not found", { status: 404 });
  }

  // if directory doesn't end with "/" (http://example.com/test), redirect
  if (!baseFilePath.endsWith("/")) {
    return new Response(null, {
      status: 301,
      headers: { location: url + "/" },
    });
  } else {
    return await serveFile(ctx.req, htmlFilePath, { fileInfo: htmlFile });
  }
};

const logWrapper: Middleware = async (ctx: Context, next: Middleware) => {
  const res = await next(ctx);
  console.log(`${res.status} ${ctx.req.method} ${ctx.req.url}`);
  return res;
};
