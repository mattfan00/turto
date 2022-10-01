import { showdown } from "../deps.ts";
import { Engine } from "./engine.ts";

export class MarkdownConverter implements Engine<showdown.Converter> {
  engine: showdown.Converter;

  constructor() {
    this.engine = new showdown.Converter();
    this.engine.setFlavor("original");
  }

  run(mdStr: string) {
    return this.engine.makeHtml(mdStr);
  }
}
