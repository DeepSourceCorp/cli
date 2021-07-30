<template>
  <div
    @click="isErrorsBlockExpanded = true"
    class="relative items-start rounded-md bg-ink-200"
    :class="{
      'cursor-pointer': !isErrorsBlockExpanded
    }"
  >
    <button
      class="absolute p-1 top-4 right-4 focus:outline-none"
      @click.stop="isErrorsBlockExpanded = !isErrorsBlockExpanded"
    >
      <z-icon
        icon="chevron-down"
        class="transform"
        :class="isErrorsBlockExpanded ? 'rotate-180' : ''"
      />
    </button>
    <div v-if="isErrorsBlockExpanded" class="divide-y divide-ink-100">
      <template v-for="(errors, key) in runErrors">
        <div v-if="errors.length" :key="key" class="p-4">
          <z-label class="inline-block select-none" :state="key">
            {{ getErrorTypeLabel(key) }}
          </z-label>
          <ul class="mt-4 space-y-2">
            <li
              v-for="(error, index) in errors"
              :key="index"
              class="flex items-start ml-1 space-x-2"
            >
              <span
                class="h-5 w-5 rounded-full grid place-content-center bg-ink-300 text-xs mt-0.5 select-none"
              >
                {{ index + 1 }}
              </span>
              <p class="max-w-4xl prose-sm prose prose-indigo" v-html="error.message"></p>
            </li>
          </ul>
        </div>
      </template>
    </div>
    <div class="flex items-center p-4 space-x-1 text-sm font-medium text-vanilla-100" v-else>
      <z-label v-if="runErrors.error.length" class="inline-block select-none" state="error">
        {{ runErrors.error.length }} {{ runErrors.error.length > 1 ? 'errors' : 'error' }}
      </z-label>
      <z-label v-if="runErrors.warning.length" class="inline-block select-none" state="warning">
        {{ runErrors.warning.length }}
        {{ runErrors.warning.length > 1 ? 'warnings' : 'warning' }}
      </z-label>
      <z-label v-if="runErrors.info.length" class="inline-block select-none" state="info">
        {{ runErrors.info.length }}
        {{ runErrors.info.length > 1 ? 'messages' : 'message' }}
      </z-label>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZLabel, ZButton } from '@deepsourcelabs/zeal'

export interface RunError {
  level: number
  message: string
}

@Component({
  components: {
    ZIcon,
    ZLabel,
    ZButton
  },
  layout: 'repository'
})
export default class AnalyzerRunError extends Vue {
  @Prop({ default: () => [] })
  errorsRendered: RunError[]

  public isErrorsBlockExpanded = false

  get runErrors(): Record<string, RunError[]> {
    return {
      error: this.errorsRendered.filter((error) => error.level === 0),
      warning: this.errorsRendered.filter((error) => error.level === 1),
      info: this.errorsRendered.filter((error) => error.level === 2)
    }
  }

  getErrorTypeLabel(key: string): string {
    const map: Record<string, string> = {
      error: 'Errors',
      warning: 'Warnings',
      info: 'Messages'
    }

    return map[key]
  }
}
</script>
