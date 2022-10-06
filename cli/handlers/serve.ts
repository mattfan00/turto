import { http, path } from "../../deps.ts";
import { turto } from "../../mod.ts";
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

  await http.serveListener(listener, (req) => {
    const decodedUrl = decodeURI(req.url);
    const url = new URL(decodedUrl);

    if (req.method === "GET") {
      const filePath = path.join(baseDir, url.pathname);
      let file: Deno.FileInfo;
      try {
        file = Deno.statSync(filePath)
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          logEvent(404, req.method, url.pathname);
          return new Response("Not found", { status: 404 })
        } else {
          throw err;
        }
      }

      if (file.isFile) {
        logEvent(200, req.method, url.pathname);
        return new Response("is file", { status: 200 });
      }


      logEvent(200, req.method, url.pathname);
      return new Response("hello", { status: 200 });
    } else {
      logEvent(405, req.method, url.pathname);
      return new Response("", { status: 405 });
    }
  });
};

const logEvent = (status: number, method: string, path: string) => {
  console.log(`${status} ${method} ${path}`);
}
