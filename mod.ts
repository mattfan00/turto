import { Site } from "./core/site.ts";
import * as perf from "./core/utils/perf.ts";

const start = () => {
  perf.track("build-site");

  const site = new Site({
    src: "./example",
  });
  site.build();

  perf.logDuration("build-site");
};

start();

export default start;
