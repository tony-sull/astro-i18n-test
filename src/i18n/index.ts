import type { AstroIntegration } from 'astro'
import type { InitOptions, Resource } from 'i18next'
import * as fs from 'fs'
import * as path from 'path'
import { parse as parseYAML } from 'yaml'

interface AstroI18nextOptions {
  resourcesPath?: string
  i18next: InitOptions
}

const supportedFormats = ['.json', '.yaml']
const parse = (content: string, format: string) => {
  switch (format) {
    case '.json':
      return JSON.parse(content)
    case '.yaml':
      return parseYAML(content)
  }
  throw new Error(`Invalid format: ${format}`)
}

const loadResources = (resourcesPath: string, supportedLocales: string[]): Resource => {
  const resources = {}

  const translationFilenames = fs.readdirSync(resourcesPath)

  translationFilenames.forEach(filename => {
    const { name, ext } = path.parse(filename)

    // check if language is supported before loading the resource
    if (supportedLocales.includes(name) && supportedFormats.includes(ext)) {
      const rawContents = fs.readFileSync(resourcesPath + filename)
      resources[name] = {
        translation: parse(rawContents.toString(), ext),
      }
    }
  })

  return resources
}

export default (options: AstroI18nextOptions): AstroIntegration => {
  return {
    name: 'astro-i18next',
    hooks: {
      'astro:config:setup': async ({ config, injectScript, updateConfig }) => {
        options.i18next.resources = loadResources(options.resourcesPath, options.i18next.supportedLngs)
        options.i18next.fallbackLng = [...options.i18next.supportedLngs]

        // init i18next on every page
        injectScript(
          'page-ssr',
          `import i18next from "i18next";
           i18next.init(${JSON.stringify(options.i18next)});`,
        )
      },
    },
  }
}
