import { Component, Vue } from 'nuxt-property-decorator'

import { RepoConfigInterface } from '~/store/repository/detail'
import { TransformerInterface } from '~/store/analyzer/list'

const TAB = '  '
const NEWLINE = '\n'
const INDENT = `${NEWLINE}${TAB}`

function parseArray(arr: string[], indent = 1) {
  if (arr.length === 0) {
    return ''
  }
  if (arr.length === 1) {
    return JSON.stringify(arr)
  }

  const candidates = arr
    .filter(Boolean)
    .map((val: string): string => {
      return JSON.stringify(val)
    })
    .join(`,${NEWLINE}${TAB.repeat(indent)}`)
  return `[${NEWLINE}${TAB.repeat(indent)}${candidates}${NEWLINE}${TAB.repeat(indent - 1)}]`
}

@Component
export default class TomlGeneratorMixin extends Vue {
  tomlTemplate(
    config: RepoConfigInterface,
    testPatterns: RepoConfigInterface['test_patterns'],
    excludePatterns: RepoConfigInterface['exclude_patterns']
  ): string {
    const toml = [`version = ${JSON.stringify(config.version)}`]

    if (testPatterns && testPatterns.length) {
      if (testPatterns.filter(Boolean).length) {
        toml.push(this.testPatternsTemplate(testPatterns))
      }
    }

    if (excludePatterns && excludePatterns.length) {
      if (excludePatterns.filter(Boolean).length) {
        toml.push(this.excludePatternsTemplate(excludePatterns))
      }
    }

    if (config.analyzers && config.analyzers.length) {
      toml.push(this.analyzersTemplate(config.analyzers))
    }

    if (config.transformers && config.transformers.length) {
      toml.push(this.transformersTemplate(config.transformers))
    }

    return toml.join(NEWLINE.repeat(2))
  }

  testPatternsTemplate(testPatterns: string[]): string {
    // Returns a toml template string of test patterns section
    return testPatterns.length ? `test_patterns = ${parseArray(testPatterns)}` : ''
  }

  excludePatternsTemplate(excludePatterns: string[]): string {
    // Returns a toml template string of exclude patterns section
    return excludePatterns.length ? `exclude_patterns = ${parseArray(excludePatterns)}` : ''
  }

  analyzersTemplate(allAnalyzers: RepoConfigInterface['analyzers']): string {
    // Returns a toml template string of analyzers section (including it's meta)
    return allAnalyzers
      .map((analyzer) => {
        const headerLines = ['[[analyzers]]', `name = ${JSON.stringify(analyzer.name)}`]
        if (!analyzer.enabled) headerLines.push('enabled = false')

        const header = headerLines.join(NEWLINE)

        const meta = [header]

        if (analyzer.meta) {
          const metaOptions = Object.keys(analyzer.meta)
            .map((metaAttribute: string) => {
              if (!analyzer.meta) return ''
              const val = analyzer.meta[metaAttribute] as string[] | string | number | boolean
              if (Array.isArray(val)) {
                if (val.length) {
                  return `${metaAttribute} = ${parseArray(val, 2)}`
                }
                return null
              }
              if (val || val === false || val === 0) {
                return `${metaAttribute} = ${JSON.stringify(val)}`
              }
              return null
            })
            .filter((opt) => opt) // Remove all empty values

          if (metaOptions.length) {
            meta.push(
              [
                '', // skip a line
                '[analyzers.meta]',
                ...metaOptions
              ].join(INDENT)
            )
          }
        }

        return meta.join(NEWLINE)
      })
      .join(NEWLINE.repeat(2))
  }

  transformersTemplate(allTransformers: RepoConfigInterface['transformers']): string {
    // Returns a toml template string of transformers section
    return allTransformers
      .map((transformer: TransformerInterface) => {
        const headerLines = ['[[transformers]]', `name = ${JSON.stringify(transformer.name)}`]
        if (!transformer.enabled) headerLines.push('enabled = false')

        return headerLines.join(NEWLINE)
      })
      .join(NEWLINE.repeat(2))
  }
}
