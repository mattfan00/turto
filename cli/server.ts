import { http, path, serveFile } from "../deps.ts";
import { getFileInfo } from "./utils.ts";

export class Server {
  options: ServerOptions;

  constructor(options: ServerOptions) {
    this.options = options;
  }

  async handle(req: Request) {
    if (req.method !== "GET") {
      return new Response(null, { status: 405 });
    }

    const decodedUrl = decodeURI(req.url);
    const url = new URL(decodedUrl);

    const baseFilePath = path.join(this.options.base, url.pathname);
    const baseFile = getFileInfo(baseFilePath);

    if (!baseFile) {
      return new Response("Not found", { status: 404 });
    }

    if (baseFile.isFile) {
      return await serveFile(req, baseFilePath, { fileInfo: baseFile });
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
      return await serveFile(req, htmlFilePath, { fileInfo: htmlFile });
    }
  }

  async listen(options: Deno.ListenOptions) {
    const listener = Deno.listen(options);
    console.log(`Started server on port ${options.port}\n`);

    await http.serveListener(listener, async (req) => await this.handle(req));
  }
}

export interface ServerOptions {
  /** Base directory to read files from */
  base: string;
}
