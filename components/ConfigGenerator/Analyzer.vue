<template>
  <div class="text-base font-normal rounded-md bg-ink-300">
    <div class="flex items-center justify-between p-4">
      <div
        class="flex items-center space-x-2 font-bold select-none text-vanilla-100"
        @click="isCollapsed = !isCollapsed"
        :class="{
          'cursor-pointer': hasCollapsibleContent
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
          v-if="collapsible && hasCollapsibleContent"
          class="duration-150 transform"
          size="x-small"
          :class="{
            '-rotate-90': isCollapsed
          }"
          icon="triangle-down"
        />
      </div>
      <button
        @click="onClose"
        v-if="!readOnly"
        v-tooltip="{ content: 'Remove Analyzer', delay: { show: 700, hide: 100 } }"
        class="p-1 rounded-md cursor-pointer hover:bg-cherry-600 hover:bg-opacity-20"
      >
        <z-icon icon="trash-2" color="cherry" size="small"></z-icon>
      </button>
    </div>
    <form v-show="!isCollapsed" class="-mt-1 divide-y divide-ink-200">
      <div v-if="Array.isArray(configItems) && configItems.length">
        <template v-for="config in configItems">
          <div :key="config.title" class="p-3 pt-0 space-y-2 text-vanilla-200">
            <span class="flex items-center space-x-2">
              <label class="text-xs text-vanilla-400">
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
                <z-radio-group
                  :read-only="readOnly"
                  v-model="config.selected"
                  class="grid grid-cols-2 gap-2 -mb-2 text-xs md:grid-cols-3 lg:grid-cols-5"
                >
                  <z-radio
                    v-for="option in config.enum"
                    :key="option"
                    :read-only="readOnly"
                    :value="option"
                    :label="config.labels ? config.labels[option] : option"
                    class="mb-2 mr-4"
                  />
                </z-radio-group>
              </template>
              <template v-else>
                <z-input
                  v-tooltip="forTemplate ? 'This value will be added during runtime' : ''"
                  v-model="config.selected"
                  :disabled="forTemplate && hasTemplate(config)"
                  :read-only="readOnly && !(forTemplate && hasTemplate(config))"
                  size="small"
                  class="rounded-md"
                />
              </template>
            </template>
            <template v-else-if="config.type == 'boolean'">
              <z-radio-group
                :readOnly="readOnly"
                :modelValue="`${Number(config.selected)}`"
                @change="(val) => (config.selected = Boolean(Number(val)))"
                class="grid grid-cols-3 text-xs gap-y-2 gap-x-4 md:grid-cols-6 lg:grid-cols-8"
              >
                <!--Make these values boolean true and false-->
                <z-radio value="1" label="Yes" />
                <z-radio value="0" label="No" />
              </z-radio-group>
            </template>
            <template v-else-if="config.type == 'array'">
              <div
                v-if="config.items && config.items.enum"
                class="grid grid-cols-2 gap-2 -mb-2 text-xs md:grid-cols-3 lg:grid-cols-5"
              >
                <z-checkbox
                  class="mb-2 mr-4"
                  v-for="option in config.items.enum"
                  :key="option"
                  :label="config.labels ? config.labels[option] : option"
                  :readOnly="readOnly"
                  :value="option"
                  size="small"
                  :modelValue="
                    Array.isArray(config.selected) ? config.selected.includes(option) : false
                  "
                  @change="(isChecked) => updateChecks(option, isChecked, config)"
                />
              </div>
              <div v-else>
                <z-input
                  v-tooltip="
                    forTemplate && hasTemplate(config)
                      ? 'This value will automatically be filled during runtime'
                      : ''
                  "
                  :value="Array.isArray(config.selected) ? config.selected.join(', ') : ''"
                  :disabled="forTemplate && hasTemplate(config)"
                  :read-only="readOnly && !(forTemplate && hasTemplate(config))"
                  size="small"
                  class="rounded-md"
                  @input="(value) => updateArray(value, config)"
                />
              </div>
            </template>
            <template v-else-if="config.type == 'integer'">
              <z-input
                class="rounded-md"
                :disabled="forTemplate && hasTemplate(config)"
                :readOnly="readOnly && !(forTemplate && hasTemplate(config))"
                v-tooltip="
                  forTemplate && hasTemplate(config)
                    ? 'This value will automatically be filled during runtime'
                    : ''
                "
                v-model="config.selected"
                size="small"
                type="number"
              />
            </template>
          </div>
        </template>
      </div>
      <div
        v-if="showTransformers"
        class="p-3 space-y-2"
        :class="Array.isArray(configItems) && configItems.length ? '' : 'pt-0'"
      >
        <label class="font-medium leading-none tracking-widest uppercase text-xxs text-vanilla-400"
          >Transformers</label
        >
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="transformer in transformerItems"
            :key="transformer.shortcode"
            @click.prevent="toggleTransformer(transformer)"
            class="flex items-center justify-between p-1 pl-2 text-sm border rounded-md"
            :class="[
              transformer.enabled ? 'bg-ink-200 border-ink-100' : 'border-ink-200',
              readOnly ? 'cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <div
              class="flex items-center space-x-2"
              :class="readOnly ? 'text-vanilla-400' : 'text-vanilla-200'"
            >
              <img :src="transformer.logo" class="w-auto h-3" :alt="transformer.name" />
              <span>{{ transformer.name }}</span>
            </div>
            <z-checkbox
              :readOnly="readOnly"
              :value="transformer.shortcode"
              size="small"
              v-model="transformer.enabled"
            />
          </div>
        </div>
      </div>

      <div v-else-if="showInstallAutofixAppCTA" class="p-3 space-y-2">
        <label class="text-sm tracking-wide text-vanilla-400">Transformers</label>
        <div class="px-4 py-6 space-y-5 text-sm text-center border border-ink-100">
          <h4 class="text-base font-medium text-vanilla-100">
            Enable Autofix app on {{ $providerMetaMap[$route.params.provider].text }}
          </h4>

          <p class="text-vanilla-400">
            To create commits and pull-requests automatically, we need the Autofix app installed on
            the account with access to this repository.
          </p>

          <div v-if="canEnableAutofix">
            <z-button
              v-if="installing"
              :disabled="true"
              button-type="ghost"
              color="vanilla-100"
              size="small"
              class="flex items-center w-48 bg-ink-200"
            >
              <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
              Verifying installation
            </z-button>
            <z-button
              v-else
              button-type="ghost"
              color="vanilla-100"
              icon="autofix"
              size="small"
              class="w-48 modal-primary-action bg-ink-200"
              @click="openAutofixInstallationUrl(close)"
              >Install Autofix app</z-button
            >
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { toSentenceCase } from '@/utils/string'
import {
  ZButton,
  ZCheckbox,
  ZIcon,
  ZInput,
  ZOption,
  ZRadio,
  ZRadioGroup
} from '@deepsourcelabs/zeal'
import { Component, mixins, namespace, Prop, Watch } from 'nuxt-property-decorator'

import InstallAutofixMixin from '~/mixins/installAutofixMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import {
  AnalyzerMetaInterface,
  AnalyzerMetaProperitiesInterface,
  TransformerInterface
} from '~/store/analyzer/list'
import { AppFeatures } from '~/types/permTypes'
import { Repository, TransformerTool } from '~/types/types'

const repoDetailStore = namespace('repository/detail')

/**
 * Analyzer component
 */
@Component({
  components: {
    ZButton,
    ZIcon,
    ZInput,
    ZCheckbox,
    ZOption,
    ZRadioGroup,
    ZRadio
  },
  methods: { toSentenceCase }
})
export default class Analyzer extends mixins(InstallAutofixMixin, RoleAccessMixin) {
  @repoDetailStore.State
  repository: Repository

  @Prop({ default: 'z-lock' })
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

  @Prop({ default: () => [] })
  availableTransformers: Array<TransformerTool>

  @Prop({ default: () => [] })
  selectedTransformers: Array<TransformerInterface>

  @Prop({ default: false })
  forTemplate: Boolean

  @Prop({ default: false })
  readOnly: Boolean

  @Prop({ default: true })
  collapsible: Boolean

  public configItems: Array<AnalyzerMetaProperitiesInterface> = []
  public transformerItems: Array<TransformerInterface> = []
  public invalidFields: Array<string> = []
  public isCollapsed = false

  /**
   * Update collapse state based on the value for readOnly prop
   *
   * @returns {void}
   */
  @Watch('readOnly')
  updateIsCollapseOnReadStatusChange(): void {
    if (this.readOnly) {
      this.isCollapsed = false
    }
  }

  /**
   * Toggle transformer enabled state based on the value for readOnly prop
   *
   * @returns {void}
   */
  toggleTransformer(transformer: TransformerInterface) {
    if (!this.readOnly) {
      transformer.enabled = !transformer.enabled
    }
  }

  /**
   * Discards Transformers and emit `onClose` event
   *
   * @returns {void}
   */
  public onClose(): void {
    // remove all transformers
    this.removeAllTransformers()
    this.$emit('onClose')
  }

  get hasCollapsibleContent(): boolean {
    return this.configItems.length > 0 || this.showTransformers || this.showInstallAutofixAppCTA
  }

  get properties(): AnalyzerMetaInterface['properties'] {
    return this.analyzerMeta.properties
  }

  get showInstallAutofixAppCTA(): boolean {
    // Show the CTA to install Autofix app only on config generator page
    if (this.$route.name !== 'provider-owner-repo-generate-config') {
      return false
    }

    return (
      this.availableTransformers.length > 0 &&
      this.allowAutofix &&
      !this.repository.isAutofixEnabled
    )
  }

  get showTransformers(): boolean {
    const { provider } = this.$route.params
    // if (!this.$gateKeeper.provider(AppFeatures.TRANSFORMS, provider)) {
    //   return false
    // }

    if (this.forTemplate) {
      return this.availableTransformers.length > 0
    }

    return Boolean(this.repository.isAutofixEnabled && this.availableTransformers.length > 0)
  }

  mounted(): void {
    this.generateConfigItems()
    this.generateTransformerItems()
  }

  /**
   * Replace template with actual/placeholder data
   *
   * @param {string} candidate
   * @returns {string}
   */
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
      .replaceAll('<%=  name %>', this.forTemplate ? '<repository-name>' : repo)
  }

  /**
   * Check if the config selected property has template data
   *
   * @param {AnalyzerMetaProperitiesInterface} config
   * @returns {boolean}
   */
  hasTemplate(config: AnalyzerMetaProperitiesInterface): boolean {
    if (typeof config.selected === 'string') {
      return (
        config.selected.includes('<%=  vcs_host %>') ||
        config.selected.includes('<%=  login %>') ||
        config.selected.includes('<%=  name %>')
      )
    }
    return false
  }

  /**
   * Generate config items from analyzer meta properties
   *
   * @returns {void}
   */
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

            if (typeof selected === 'string') {
              selected = this.parseTemplate(selected)
            }

            if (Array.isArray(selected) && selected.length) {
              selected = selected.map((item) =>
                typeof item === 'string' ? this.parseTemplate(item) : item
              )
            }
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

  /**
   * Generate Transformer items based on the selection
   *
   * @returns {void}
   */
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

  /**
   * Update Transformer items when selectedTransformers list changes
   *
   * @returns {void}
   */
  @Watch('selectedTransformers.length')
  updateTransformerItems(): void {
    this.generateTransformerItems()
  }

  /**
   * Update the value for selected key based on the value for isChecked
   *
   * @param {string} option
   * @param {number} isChcked
   * @param {Record<string, string[]>} objectToUpdate
   * @returns {void}
   */
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

  /**
   * Update the value for selected key
   *
   * @param {string} option
   * @param {Record<string, string[]>} objectToUpdate
   * @returns {void}
   */
  updateArray(option: string, objectToUpdate: Record<string, string[]>): void {
    objectToUpdate.selected = option
      .split(',') // comma separeted
      .filter((val) => val) // non empty
      .map((val) => val.trim()) // no trailing or leading spaces
  }

  /**
   * Compute invalid fields from config items
   *
   * @returns {number}
   */
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

  /**
   * Update analyzer entries when configItems change
   *
   * @returns {void}
   */
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

  /**
   * Update Transformer entries when transformerItems change
   *
   * @returns {void}
   */
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

  /**
   * Remove all Transformer entries
   *
   * @returns {void}
   */
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
