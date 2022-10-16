const cache = new Map<string, number>();

export const track = (name: string) => {
  cache.set(name, performance.now());
};

export const logDuration = (name: string) => {
  const start = cache.get(name);
  if (!start) throw new Error(`"${name}" has not been tracked`);

  const end = performance.now();
  const time = duration(cache.get(name)!, end);

  console.log(`Execution time of "${name}": ${format(time)}`);
};

const format = (num: number) => {
  return num.toFixed(5);
};

const duration = (start: number, end: number) => {
  return end - start;
};
