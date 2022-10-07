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

  const baseDir = site.getDest();

  await http.serveListener(listener, async (req) => {
    const decodedUrl = decodeURI(req.url);
    const url = new URL(decodedUrl);

    if (req.method !== "GET") {
      logEvent(405, req.method, url.pathname);
      return new Response(null, { status: 405 });
    }

    const baseFilePath = path.join(baseDir, url.pathname);
    const baseFile = getFileInfo(baseFilePath);

    if (!baseFile) {
      logEvent(404, req.method, url.pathname);
      return new Response("Not found", { status: 404 });
    }

    if (baseFile.isFile) {
      logEvent(200, req.method, url.pathname);
      return await serveFile(req, baseFilePath, { fileInfo: baseFile });
    }

    // if directory then check if it contains an "index.html" file
    const htmlFilePath =
      (baseFilePath.endsWith("/") ? baseFilePath : baseFilePath + "/") +
      "index.html";
    const htmlFile = getFileInfo(htmlFilePath);

    // if no "index.html" file, then return 404
    if (!htmlFile) {
      logEvent(404, req.method, url.pathname);
      return new Response("Not found", { status: 404 });
    }

    // if directory doesn't end with "/" (http://example.com/test), redirect
    if (!baseFilePath.endsWith("/")) {
      logEvent(301, req.method, url.pathname);
      return new Response(null, {
        status: 301,
        headers: { location: url + "/" },
      });
    } else {
      logEvent(200, req.method, url.pathname);
      return await serveFile(req, htmlFilePath, { fileInfo: htmlFile });
    }
  });
};

const logEvent = (status: number, method: string, path: string) => {
  console.log(`${status} ${method} ${path}`);
};
