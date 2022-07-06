<template>
  <z-accordion>
    <z-accordion-item
      :is-open="isAccordionOpen"
      :span-custom-height="true"
      custom-max-height="max-h-item"
      class="bg-ink-300 rounded-md border border-ink-200 mb-4"
    >
      <template #title>
        <div class="flex items-center justify-between px-4 py-2 text-sm bg-ink-300 rounded-md">
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
              class="text-vanilla-100 text-sm font-semibold flex items-center gap-x-1"
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
                class="transition-all duration-300 transform ml-1 my-auto stroke-2"
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
              class="flex flex-col w-full bg-ink-400"
            >
              <div class="w-full flex gap-x-1 items-center leading-7 py-2 px-4">
                <z-checkbox
                  v-model="selectedIssues"
                  :value="issue"
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
                      ><span class="text-vanilla-300 mr-1.5">{{ issue.title }}</span>
                    </nuxt-link>
                    <span class="text-slate">{{ issue.shortcode }}</span>
                  </span>
                  <span class="text-vanilla-400 flex space-x-1">
                    <span class="text-xs">×</span>
                    <span>{{ issue.occurrenceCount }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!autofixableIssues.length"
            class="h-24 px-4 w-full flex flex-col gap-y-1 justify-center items-center"
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
import { ZButton, ZAccordion, ZAccordionItem, ZCheckbox, ZIcon } from '@deepsourcelabs/zeal'
import RunDetailMixin from '~/mixins/runDetailMixin'

export interface RunError {
  level: number
  message: string
}

/**
 * Bar to show autofix counts and button to trigger it
 */
@Component({
  components: {
    ZButton,
    ZAccordion,
    ZAccordionItem,
    ZCheckbox,
    ZIcon
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
  public selectedIssues: Record<string, string>[] = []
  public selectAll = true

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
   * @returns {Array<string>} Returns an array of shortcodes of the selectedIssues.
   */
  get selectedIssueShortcodeArray(): Array<string> {
    const shortcodeArray: Array<string> = this.selectedIssues.map((issue) => {
      return issue.shortcode
    })
    return shortcodeArray
  }

  /**
   * Watcher for `selectAll`. Selects all issues (w/ searched filter if available) when `newVal` is true.
   *
   * @param {boolean} newVal - Updated value of `selectAll`.
   * @returns {void}
   */
  @Watch('selectAll', { immediate: true })
  public updateSelectAll(newVal: boolean): void {
    this.selectedIssues = newVal ? this.autofixableIssues : []
  }

  /**
   * Watcher for the `autofixLoading` prop. Collapses the accordion if the prop value changes to false, indicating that the action is completed
   *
   * @returns {void}
   */
  @Watch('autofixLoading')
  public closeAccordion() {
    if (this.autofixLoading === false) this.isAccordionOpen = false
  }

  /**
   * Triggers Autofix on the selected issues by emitting the 'autofixIssies' event, with a list of selected issue shortcodes
   *
   * @returns {void}
   */
  triggerAutofixOnSelectedIssues(): void {
    this.$emit('autofixIssues', this.selectedIssueShortcodeArray)
  }

  /**
   * Function to check if a given `issue` is already present in list of `selectedIssues` or not.
   *
   * @param {Record<string, string>[]} selectedIssues
   * @param {Record<string, string>} issue
   * @returns {boolean} - Returns `true` if an issue is already selected.
   */
  public isIssueSelected(
    selectedIssues: Record<string, string>[],
    issue: Record<string, string>
  ): boolean {
    return selectedIssues.includes(issue)
  }
}
</script>
