<template>
  <z-accordion>
    <z-accordion-item
      :is-open="isAccordionOpen"
      :span-custom-height="true"
      custom-max-height="max-h-item"
      class="rounded-md border border-slate-400 bg-ink-300"
    >
      <template #title>
        <div class="flex items-center justify-between rounded-md bg-ink-300 px-4 py-2 text-sm">
          <div class="flex space-x-1">
            <z-checkbox
              v-model="selectAll"
              :true-value="true"
              :false-value="false"
              size="small"
              spacing="4"
              @change="updateSelectAll"
            />
            <button
              class="flex items-center gap-x-1 text-sm font-semibold text-vanilla-100"
              @click="toggleAccordion"
            >
              {{ autofixableIssues.length }}
              <span class="hidden md:inline-block"> Autofixable</span>
              {{ autofixableIssues.length === 1 ? 'issue' : 'issues' }}
              <span class="hidden md:inline-block"
                >in
                {{ filesAffectedByAutofix }}
                {{ filesAffectedByAutofix > 1 ? 'files' : 'file' }}
              </span>
              <z-icon
                icon="chevron-down"
                class="my-auto ml-1 transform stroke-2 transition-all duration-300"
                :class="{ 'rotate-180': isAccordionOpen }"
              />
            </button>
          </div>

          <!-- Wrap the Autofix button in a div element since some browsers don't emit events for disabled elements -->
          <div
            v-tooltip="
              canCreateAutofix ? '' : `You don't have sufficient permission to run Autofix`
            "
          >
            <z-button
              :disabled="!canCreateAutofix"
              :is-loading="autofixLoading"
              button-type="primary"
              size="small"
              spacing="px-10"
              icon="autofix"
              label="Autofix"
              @click="handleClick"
            />
          </div>
        </div>
      </template>
      <div>
        <div class="flex flex-col overflow-y-auto">
          <div class="divide-y divide-ink-200">
            <div
              v-for="issue in autofixableIssues"
              :key="issue.shortcode"
              class="flex w-full flex-col bg-ink-400"
            >
              <div class="flex w-full items-center gap-x-1 px-4 py-2 leading-7">
                <z-checkbox
                  v-model="selectedIssues"
                  :value="issue.shortcode"
                  :true-value="true"
                  :false-value="false"
                  size="small"
                  spacing="4"
                  class="align-top"
                />
                <div class="flex w-full space-x-2 text-sm">
                  <span class="flex-grow">
                    <nuxt-link
                      :to="
                        $generateRoute([
                          'run',
                          $route.params.runId,
                          $route.params.analyzer,
                          issue.shortcode
                        ])
                      "
                    >
                      <span
                        class="mr-1.5 text-vanilla-300"
                        v-html="safeRenderBackticks(issue.title)"
                      ></span>
                    </nuxt-link>
                    <span class="text-slate">{{ issue.shortcode }}</span>
                  </span>
                  <span class="flex space-x-1 text-vanilla-400">
                    <span class="text-xs">×</span>
                    <span>{{ issue.occurrenceCount }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!autofixableIssues.length"
            class="flex h-24 w-full flex-col items-center justify-center gap-y-1 px-4"
          >
            <h2 class="text-md font-bold">No matching issues found</h2>
            <p class="text-md">Try changing the search query.</p>
          </div>
        </div>
      </div>
    </z-accordion-item>
  </z-accordion>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { safeRenderBackticks } from '~/utils/string'
import RunDetailMixin from '~/mixins/runDetailMixin'
import { checkArrayEquality } from '~/utils/array'

export interface RunError {
  level: number
  message: string
}

/**
 * Bar to show autofix counts and button to trigger it
 */
@Component({
  methods: {
    safeRenderBackticks
  }
})
export default class RunAutofixBar extends mixins(RunDetailMixin) {
  @Prop({ default: '' })
  id: string

  @Prop({ default: '' })
  autofixableIssues: Array<Record<string, string>>

  @Prop({ default: true })
  canCreateAutofix!: boolean

  @Prop({ default: '' })
  filesAffectedByAutofix: number

  @Prop({ default: false })
  autofixLoading: boolean

  public isAccordionOpen = false
  public selectedIssues: Array<string> = []
  public selectAll = true

  /**
   * Mounted hook for the vue component.
   * Initializes `selectedIssues` to all `autofixableIssues` if `selectAll` is true
   *
   * @returns {void}
   */
  mounted(): void {
    this.selectedIssues = this.selectAll
      ? this.autofixableIssues.map((issue) => issue.shortcode)
      : []
  }

  /**
   * Toggles the accordion state
   *
   * @returns {void}
   */
  toggleAccordion(): void {
    this.isAccordionOpen = !this.isAccordionOpen
  }

  /**
   * Handles the click event for the Autofix button
   * Opens the accordion if in the collapsed state, else triggers an Autofix on the selected issues
   *
   * @returns {void}
   */
  handleClick(): void {
    if (!this.isAccordionOpen) this.toggleAccordion()
    else this.triggerAutofixOnSelectedIssues()
  }

  /**
   * Watcher for `selectAll`. Selects all issues (w/ searched filter if available) when `newVal` is true.
   *
   * @param {boolean} newVal - Updated value of `selectAll`.
   * @returns {void}
   */
  public updateSelectAll(newVal: boolean): void {
    this.selectedIssues = newVal ? this.autofixableIssues.map((issue) => issue.shortcode) : []
  }

  /**
   * Watcher for the `autofixLoading` prop. Collapses the accordion if the prop value changes to false, indicating that the action is completed
   *
   * @returns {void}
   */
  @Watch('autofixLoading')
  public closeAccordion(): void {
    if (this.autofixLoading === false) this.isAccordionOpen = false
  }

  /**
   * Watcher for the `selectedIssues` data property.
   * Toggles `selectAll` based on `selectedIssues` having all `autofixableIssueShortcodes`.
   *
   * @param {Array<String>} updatedSelectedIssues
   * @returns {void}
   */
  @Watch('selectedIssues')
  toggleSelectAll(updatedSelectedIssues: Array<string>): void {
    const autofixableIssueShortcodes = this.autofixableIssues.map((issue) => issue.shortcode)

    // Set selectAll to true if selectedIssues is same as autofixableIssues, else set to false
    this.selectAll = checkArrayEquality(autofixableIssueShortcodes, updatedSelectedIssues)
  }

  /**
   * Triggers Autofix on the selected issues by emitting the 'autofixIssies' event, with a list of selected issue shortcodes
   *
   * @returns {void}
   */
  triggerAutofixOnSelectedIssues(): void {
    this.$emit('autofixIssues', this.selectedIssues)
  }
}
</script>
