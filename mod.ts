import { Site } from "./core/site.ts";

const start = () => {
  const site = new Site();
  site.generate()
};

start()

export default start;