export interface Engine<T> {
  engine: T;
  // deno-lint-ignore ban-types
  run: Function;
}
