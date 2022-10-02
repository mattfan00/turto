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
};
