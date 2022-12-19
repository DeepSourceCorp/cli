<template>
  <div
    class="box-border relative flex flex-col p-2 space-y-3 overflow-scroll rounded-md h-72 min-h-1/2 md:h-44 bg-ink-400 md:min-w-1/2 md:w-1/2"
    :class="{ 'justify-center items-center space-y-2': !configItems.length }"
  >
    <!-- Header -->
    <div v-if="configItems.length > 0" class="flex items-center w-full space-x-2">
      <analyzer-logo
        :analyzerLogo="analyzerLogo"
        :shortcode="icon"
        :name="label"
        :hideTooltip="true"
      />
      <!-- TODO: Get Repo name and handle name -->
      <div class="flex-1 text-sm font-bold text-vanilla-200">
        {{ label }}
      </div>
      <div class="cursor-pointer" @click="onClose">
        <z-icon icon="x" size="small" color="vanilla-200"> </z-icon>
      </div>
    </div>
    <!-- Config Section -->
    <template v-for="config in configItems">
      <div :key="config.title" class="flex flex-col space-y-2">
        <div class="text-xs tracking-wide uppercase text-slate">
          {{ config.title }}
        </div>
        <template v-if="config.type == 'string'">
          <template v-if="config.enum && config.enum.length">
            <z-radio-group v-model="config.selected" class="grid grid-cols-1 gap-1 text-sm">
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
            :modelValue="`${String(config.selected)}`"
            @change="(val) => (config.selected = val === 'true')"
            class="grid grid-cols-3 gap-1 space-x-4 text-sm"
          >
            <!--Make these values boolean true and false-->
            <z-radio value="true" label="Yes"></z-radio>
            <z-radio value="false" label="No"></z-radio>
          </z-radio-group>
        </template>
        <template v-else-if="config.type == 'array'">
          <div v-if="config.items && config.items.enum" class="grid grid-cols-2 gap-1 text-sm">
            <z-checkbox
              class="mb-2 mr-4"
              size="small"
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
              :value="Array.isArray(config.selected) ? config.selected.join(', ') : ''"
              @input="(value) => updateArray(value, config)"
              size="small"
            ></z-input>
          </div>
        </template>
        <template v-else-if="config.type == 'integer'">
          <z-input v-model="config.selected" textSize="xs" type="number" />
        </template>
      </div>
    </template>
    <!-- No Config Data Section -->
    <template v-if="configItems.length == 0">
      <div class="absolute cursor-pointer top-2 right-2" @click="onClose">
        <z-icon icon="x" size="small" color="vanilla-200"> </z-icon>
      </div>
      <z-icon :icon="icon" color="pink" size="large"></z-icon>
      <div class="text-sm font-bold text-vanilla-100">{{ label }}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZCheckbox, ZOption, ZRadioGroup, ZRadio } from '@deepsource/zeal'
import { AnalyzerMetaInterface } from '~/store/analyzer/list'

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
export default class AnalyzerCard extends Vue {
  @Prop({ default: 'z-lock' })
  icon!: string

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  repo!: string

  @Prop({ default: '' })
  label!: string

  @Prop({ default: '' })
  analyzerLogo!: string

  @Prop({ default: {} })
  meta!: AnalyzerMetaInterface

  public configItems: Array<Record<string, any>> = []

  public onClose(event: Event): void {
    this.$emit('onClose', event)
  }

  get properties(): Record<string, any> {
    return this.meta.properties
  }

  created(): void {
    let props: Array<string> = []

    if (this.meta.required && this.meta.required.length) {
      props = props.concat(this.meta.required)
    }

    if (this.meta.optional_required && this.meta.optional_required.length) {
      props = props.concat(this.meta.optional_required)
    }

    this.configItems = props.map((name) => {
      const config = this.properties[name]

      if (config.type === 'boolean') {
        config.default = Boolean(config.default)
      }

      if (config.type === 'array' && Array.isArray(config.default)) {
        config.default = config.default.map((item: string) => {
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
        selected: config.default !== null ? config.default : ''
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

  parseTemplate(candidate: string): string {
    const hostmap: Record<string, string> = {
      gh: 'github.com',
      gl: 'gitlab.com',
      bb: 'bitbucket.com'
    }
    const { login, provider } = this.$route.params

    const host = provider in hostmap ? hostmap[provider] : ''

    return candidate
      .replaceAll('<%=  vcs_host %>', host)
      .replaceAll('<%=  login %>', login)
      .replaceAll('<%=  name %>', this.repo)
  }

  @Watch('configItems', { deep: true })
  configUpdated(): void {
    const meta: Record<string, string> = {}
    this.configItems.forEach((configItem: Record<string, any>) => {
      meta[configItem.name] = configItem.selected
    })

    this.$emit('configUpdated', {
      name: this.name,
      meta,
      enabled: true
    })
  }
}
</script>
