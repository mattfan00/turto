import { Page } from "./page.ts"
import { Asset } from "./asset.ts"
import { Layout } from "./layout.ts"
import { Renderer } from "./renderer.ts"

export class Site {
  options: SiteOptions

  pages: Page[]
  assets: Asset[]
  layouts: Layout[]

  renderer: Renderer

  constructor(options?: Partial<SiteOptions>) {
    this.options = {...defaultSiteOptions, ...options}
    this.pages = []
    this.assets = []
    this.layouts = []
    this.renderer = new Renderer()
  }

  generate() {
    this.read()
  }

  read() {
  }
}

export interface SiteOptions {
  /** Base directory to read from */
  src: string
  /** Directory where site will be generated */
  dest: string
}

const defaultSiteOptions: SiteOptions = {
  src: "./",
  dest: "./public"
}
