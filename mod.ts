import { Site } from "./core/site.ts";
import * as perf from "./core/utils/perf.ts";

const start = () => {
  perf.track("generate-site");

  const site = new Site({
    src: "./example",
  });
  site.generate();

  perf.logDuration("generate-site");
};

start();

export default start;
