import { Site } from "./core/site.ts";

const start = () => {
  const site = new Site({
    src: "./example",
  });
  site.generate();
};

start();

export default start;
