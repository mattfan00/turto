import { commander } from "../deps.ts";

export class CliError extends Error {
  errorOptions: commander.ErrorOptions;

  constructor(message: string, errorOptions: commander.ErrorOptions) {
    super(message)
    this.errorOptions = errorOptions;
  }
}