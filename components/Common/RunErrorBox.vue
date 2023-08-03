<template>
  <div
    class="relative items-start rounded-md bg-ink-200"
    :class="{
      'cursor-pointer': !isErrorsBlockExpanded
    }"
    @click="isErrorsBlockExpanded = true"
  >
    <button
      class="absolute right-4 top-4 p-1 focus:outline-none"
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
            <template v-for="(error, index) in errors">
              <li v-if="error.message" :key="index" class="ml-1 flex items-start space-x-2">
                <span
                  class="mt-0.5 grid h-5 w-5 flex-shrink-0 select-none place-content-center rounded-full bg-ink-300 text-xs"
                >
                  {{ index + 1 }}
                </span>
                <p class="prose-issue-description max-w-4xl" v-html="error.message"></p>
              </li>
            </template>
          </ul>
        </div>
      </template>
    </div>
    <div v-else class="flex items-center space-x-1 p-4 text-sm font-medium text-vanilla-100">
      <z-label v-if="runErrors.error.length" class="inline-block select-none" state="error">
        {{ getErrorTypeLabel('error') }}
      </z-label>
      <z-label v-if="runErrors.warning.length" class="inline-block select-none" state="warning">
        {{ getErrorTypeLabel('warning') }}
      </z-label>
      <z-label v-if="runErrors.info.length" class="inline-block select-none" state="info">
        {{ getErrorTypeLabel('info') }}
      </z-label>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

export interface RunError {
  level: number
  message?: string
  hmessage?: string
}

@Component({
  layout: 'repository'
})
export default class RunErrorBox extends Vue {
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
      error: `${this.runErrors.error.length} Error${this.runErrors.error.length > 1 ? 's' : ''}`,
      warning: `${this.runErrors.warning.length} Warning${
        this.runErrors.warning.length > 1 ? 's' : ''
      }`,
      info: `${this.runErrors.info.length} Message${this.runErrors.info.length > 1 ? 's' : ''}`
    }
    return map[key]
  }
}
</script>
