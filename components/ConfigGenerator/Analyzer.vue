<template>
  <div class="text-base font-normal rounded-sm bg-ink-300">
    <div class="flex items-center justify-between py-2 px-3">
      <div
        class="flex items-center space-x-2 font-bold text-vanilla-100 select-none"
        @click="isCollapsed = !isCollapsed"
        :class="{
          'cursor-pointer': configItems.length > 0 || showTransformers
        }"
      >
        <analyzer-logo
          :analyzerLogo="analyzerLogo"
          :shortcode="name"
          :name="label"
          :hideTooltip="true"
        />
        <span>{{ label }}</span>
        <z-icon
          v-if="configItems.length > 0 || showTransformers"
          class="transform duration-150"
          :class="{
            'rotate-180': isCollapsed
          }"
          icon="chevron-up"
        />
      </div>
      <button
        @click="onClose"
        v-tooltip="{ content: 'Remove Analyzer', delay: { show: 700, hide: 100 } }"
        class="cursor-pointer p-1 hover:bg-light-cherry hover:bg-opacity-20 rounded-md"
      >
        <z-icon icon="trash-2" color="cherry" size="small"></z-icon>
      </button>
    </div>
    <form v-show="!isCollapsed">
      <template v-for="config in configItems">
        <div :key="config.title" class="p-3 space-y-2 text-vanilla-200">
          <span class="flex items-center space-x-2">
            <label
              class="text-sm tracking-wide"
              :class="invalidFields.includes(config.name) ? 'text-vanilla-100' : 'text-vanilla-400'"
            >
              {{ config.title || toSentenceCase(config.name) }}
            </label>
            <z-icon
              v-if="invalidFields.includes(config.name)"
              icon="alert-circle"
              color="cherry"
              size="small"
              v-tooltip="{
                content: 'Value required',
                delay: { show: 100, hide: 100 }
              }"
            />
          </span>
          <template v-if="config.type == 'string'">
            <template v-if="config.enum && config.enum.length">
              <z-radio-group v-model="config.selected" class="grid grid-cols-4 gap-2 -mb-2 text-sm">
                <z-radio
                  class="mb-2 mr-4"
                  v-for="option in config.enum"
                  :key="option"
                  :value="option"
                  :label="config.labels ? config.labels[option] : option"
                ></z-radio>
              </z-radio-group>
            </template>
            <template v-else>
              <z-input v-model="config.selected" textSize="xs" />
            </template>
          </template>
          <template v-else-if="config.type == 'boolean'">
            <z-radio-group
              :modelValue="`${Number(config.selected)}`"
              @change="(val) => (config.selected = Boolean(Number(val)))"
              class="grid grid-cols-8 gap-2 space-x-4 text-sm"
            >
              <!--Make these values boolean true and false-->
              <z-radio value="1" label="Yes"></z-radio>
              <z-radio value="0" label="No"></z-radio>
            </z-radio-group>
          </template>
          <template v-else-if="config.type == 'array'">
            <div
              v-if="config.items && config.items.enum"
              class="grid grid-cols-4 gap-2 -mb-2 text-sm"
            >
              <z-checkbox
                class="mb-2 mr-4"
                v-for="option in config.items.enum"
                :key="option"
                :label="config.labels ? config.labels[option] : option"
                :value="option"
                :modelValue="
                  Array.isArray(config.selected) ? config.selected.includes(option) : false
                "
                @change="(isChecked) => updateChecks(option, isChecked, config)"
              />
            </div>
            <div v-else>
              <z-input
                :name="Array.isArray(config.selected) ? config.selected.join(', ') : ''"
                @input="(value) => updateArray(value, config)"
                textSize="xs"
              ></z-input>
            </div>
          </template>
          <template v-else-if="config.type == 'integer'">
            <z-input v-model="config.selected" textSize="xs" type="number" />
          </template>
        </div>
      </template>
      <div class="p-3 space-y-1" v-if="showTransformers">
        <label class="text-sm tracking-wide text-vanilla-400">Transformers</label>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="transformer in transformerItems"
            :key="transformer.shortcode"
            @click.prevent="() => (transformer.enabled = !transformer.enabled)"
            class="flex items-center justify-between p-2 text-sm border rounded-md cursor-pointer"
            :class="transformer.enabled ? 'bg-ink-200 border-ink-100' : 'border-ink-200'"
          >
            <div class="flex items-center space-x-2 text-vanilla-200">
              <img :src="transformer.logo" class="w-auto h-3" :alt="transformer.name" />
              <span>{{ transformer.name }}</span>
            </div>
            <z-checkbox :value="transformer.shortcode" v-model="transformer.enabled" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZCheckbox, ZOption, ZRadioGroup, ZRadio } from '@deepsourcelabs/zeal'
import { TransformerTool } from '~/types/types'
import { toSentenceCase } from '@/utils/string'

import { Repository } from '~/types/types'

const repoDetailStore = namespace('repository/detail')

import {
  AnalyzerMetaInterface,
  TransformerInterface,
  AnalyzerMetaProperitiesInterface
} from '~/store/analyzer/list'

@Component({
  components: {
    ZIcon,
    ZInput,
    ZCheckbox,
    ZOption,
    ZRadioGroup,
    ZRadio
  }
})
export default class Analyzer extends Vue {
  @repoDetailStore.State
  repository: Repository

  @Prop({ default: 'lock' })
  icon!: string

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  label!: string

  @Prop({ default: {} })
  analyzerMeta!: AnalyzerMetaInterface

  @Prop({ default: '' })
  analyzerLogo!: string

  @Prop({ default: {} })
  selectedAnalyzer: {
    name: string
    enabled: boolean
    meta: Record<string, unknown>
  }

  @Prop({ default: [] })
  availableTransformers: Array<TransformerTool>

  @Prop({ default: [] })
  selectedTransformers: Array<TransformerInterface>

  public configItems: Array<AnalyzerMetaProperitiesInterface> = []
  public transformerItems: Array<TransformerInterface> = []
  public invalidFields: Array<string> = []
  private toSentenceCase = toSentenceCase
  public isCollapsed = false

  public onClose(): void {
    // remove all transformers
    this.removeAllTransformers()
    this.$emit('onClose')
  }

  get properties(): AnalyzerMetaInterface['properties'] {
    return this.analyzerMeta.properties
  }

  get showTransformers(): boolean {
    return Boolean(this.repository.isAutofixEnabled && this.availableTransformers.length > 0)
  }

  mounted(): void {
    this.generateConfigItems()
    this.generateTransformerItems()
  }

  parseTemplate(candidate: string): string {
    const hostmap: Record<string, string> = {
      gh: 'github.com',
      gl: 'gitlab.com',
      bb: 'bitbucket.com'
    }
    const { owner, repo, provider } = this.$route.params
    let host = provider in hostmap ? hostmap[provider] : ''

    if (this.repository.vcsHost) {
      host = this.repository.vcsHost
    }
    return candidate
      .replaceAll('<%=  vcs_host %>', host)
      .replaceAll('<%=  login %>', owner)
      .replaceAll('<%=  name %>', repo)
  }

  generateConfigItems(): void {
    if (this.analyzerMeta?.required || this.analyzerMeta?.optional_required) {
      let props: Array<string> = []

      if (this.analyzerMeta?.required?.length) {
        props = props.concat(this.analyzerMeta.required)
      }

      if (this.analyzerMeta?.optional_required?.length) {
        props = props.concat(this.analyzerMeta.optional_required)
      }

      props = [...new Set(props)]

      this.configItems = props
        .filter((name) => name in this.analyzerMeta.properties)
        .map((name) => {
          const config = this.analyzerMeta.properties[name]
          // Object.assign(config, this.selectedAnalyzer)
          let selected
          if (this.selectedAnalyzer.enabled && this.selectedAnalyzer?.meta?.[name]) {
            selected = this.selectedAnalyzer.meta[name]
          }

          if (config.type === 'boolean') {
            config.default = Boolean(config.default)
          }

          if (config.type === 'array' && Array.isArray(config.default)) {
            config.default = config.default.map((item) => {
              return typeof item === 'string' ? this.parseTemplate(item) : item
            })
          }

          if (config.type === 'string') {
            if (typeof config.default === 'string') {
              config.default = this.parseTemplate(config.default)
            }
            if (Array.isArray(config.default) && config.default.length) {
              config.default = this.parseTemplate(config.default[0])
            }
          }

          return {
            ...config,
            name,
            selected: selected ? selected : config.default
          } as AnalyzerMetaProperitiesInterface
        })
    } else {
      this.configItems = []
    }
  }

  generateTransformerItems(): void {
    const selected = this.selectedTransformers.map((transformer) => {
      return transformer.name
    })

    this.transformerItems = this.availableTransformers.map((transformer) => {
      return {
        ...transformer,
        enabled: selected.includes(transformer.shortcode)
      }
    })
  }

  updateChecks(option: string, isChecked: number, objectToUpdate: Record<string, string[]>): void {
    if (!objectToUpdate.selected) {
      objectToUpdate.selected = []
    }

    if (isChecked) {
      objectToUpdate.selected.push(option)
    } else {
      objectToUpdate.selected = objectToUpdate.selected.filter((candidate) => candidate !== option)
    }
  }

  updateArray(option: string, objectToUpdate: Record<string, string[]>): void {
    objectToUpdate.selected = option
      .split(',') // comma separeted
      .filter((val) => val) // non empty
      .map((val) => val.trim()) // no traling or leading spaces
  }

  validateConfig(): number {
    const requiredFields = this.analyzerMeta.required || []
    this.invalidFields = this.configItems
      .filter((configItem: AnalyzerMetaProperitiesInterface) => {
        return requiredFields.includes(configItem.name) && !configItem.selected
      })
      .map((configItem: AnalyzerMetaProperitiesInterface) => configItem.name)

    this.isCollapsed = this.invalidFields.length == 0
    return this.invalidFields.length
  }

  @Watch('configItems', { deep: true })
  analyzersUpdated(): void {
    const meta: Record<string, string | number | boolean> = {}
    this.configItems.forEach((configItem: AnalyzerMetaProperitiesInterface) => {
      if (configItem.selected) {
        meta[configItem.name] = configItem.selected
      }
    })

    this.$emit('analyzersUpdated', {
      name: this.name,
      meta,
      enabled: true
    })
  }

  @Watch('transformerItems', { deep: true })
  transformersUpdated(): void {
    const transformers: Record<string, Record<string, string | boolean>> = {}
    this.transformerItems.forEach((transformer) => {
      transformers[transformer.shortcode] = {
        name: transformer.shortcode,
        enabled: transformer.enabled
      }
    })

    this.$emit('transformersUpdated', transformers)
  }

  removeAllTransformers(): void {
    const transformers: Record<string, Record<string, string | boolean>> = {}
    this.transformerItems.forEach((transformer) => {
      transformers[transformer.shortcode] = {
        name: transformer.shortcode,
        enabled: false
      }
    })

    this.$emit('transformersUpdated', transformers)
  }
}
</script>
