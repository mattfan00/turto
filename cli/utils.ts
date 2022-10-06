import { chalk, commander } from "../deps.ts";

export class CliError extends Error {
  errorOptions: commander.ErrorOptions;

  constructor(message: string, errorOptions: commander.ErrorOptions) {
    super(message);
    this.errorOptions = errorOptions;
  }
}

export const styles = {
  error: chalk.bold.red,
  file: chalk.green,
  success: chalk.green,
};

export const isUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (_error) {
    return false;
  }
};

export const trimPrefix = (s: string, prefix: string) => {
  if (prefix !== "" && s.startsWith(prefix)) {
    return s.slice(prefix.length);
  }
  return s;
};

export const optionParseInt = (value: string, _previous: number) => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError("Value provided is not a number");
  }
  return parsedValue;
};
