import { nunjucks } from "./deps.ts"

export class Renderer {
  engine: nunjucks.Environment
  cache: Map<string, nunjucks.Template>

  constructor() {
    this.engine = nunjucks.configure({ autoescape: false })
    this.cache = new Map()
  }
}