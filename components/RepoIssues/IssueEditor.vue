<template>
  <div>
    <z-accordion-item
      :is-open="true"
      span-custom-height
      custom-max-height="max-h-full"
      class="w-full rounded-md border border-slate-400"
      :class="{
        'pointer-events-none transform-gpu opacity-60 transition duration-300 ease-in-out filter-grayscale':
          isIgnored || (checkIssueIds.length && checkIssueIds.includes(id))
      }"
    >
      <!-- heading -->
      <template #title="{ open, toggleAccordion }">
        <div
          class="space-y-1 rounded-md border-b border-slate-400 bg-ink-300 p-3 transition-all duration-100"
          :class="open ? 'rounded-b-none border-opacity-100' : 'border-opacity-0 delay-200'"
        >
          <div class="flex justify-between gap-x-2">
            <div
              v-tooltip="open ? 'Collapse code block' : 'Expand code block'"
              class="w-full cursor-pointer space-y-1"
              @click="toggleAccordion"
            >
              <div class="flex flex-grow">
                <span
                  class="flex-grow break-all text-base font-medium text-vanilla-100"
                  v-html="safeRenderBackticks(text)"
                ></span>
              </div>
              <div
                class="block items-center space-y-1 sm:space-y-0 md:flex md:items-start md:space-x-4"
              >
                <a
                  :href="blobUrl"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="flex items-baseline gap-x-2 truncate text-xs text-vanilla-400"
                >
                  <span>
                    <z-icon
                      icon="file-text"
                      size="x-small"
                      color="vanilla-400"
                      class="-mb-0.5 flex-shrink-0"
                    />
                  </span>
                  <span
                    class="flex max-w-lg flex-wrap items-baseline"
                    v-html="getWrappablePath(path)"
                  ></span>
                </a>
              </div>
            </div>

            <!-- hide the entire block if the user doesn't have permissions to ignore issues -->
            <div v-if="canIgnoreIssues" class="flex w-12 justify-end">
              <z-menu>
                <template #trigger="{ isOpen, toggle }">
                  <z-button
                    v-tooltip="'Ignore this occurrence'"
                    type="button"
                    button-type="ghost"
                    icon="slash"
                    icon-color="vanilla-400"
                    size="small"
                    class="focus:outline-none -mt-1 -mr-1 hover:bg-ink-200"
                    :class="{ 'bg-ink-200': isOpen }"
                    @click.prevent="toggle"
                  />
                </template>
                <template #body>
                  <z-menu-section>
                    <z-menu-item @click="openIgnoreIssueModal('intentional')"
                      >This is intentional</z-menu-item
                    >
                    <z-menu-item @click="openIgnoreIssueModal('falsePositive')"
                      ><span class="text-cherry">This is a false-positive</span></z-menu-item
                    >
                  </z-menu-section>
                  <z-menu-section :divider="false" title="Other actions" class="text-left">
                    <z-menu-item @click="openIgnoreIssueModal('occurence')"
                      ><span class="overflow-hidden overflow-ellipsis leading-6"
                        >Ignore all occurrences in {{ path }}</span
                      ></z-menu-item
                    >
                  </z-menu-section>
                </template>
              </z-menu>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <!-- Code -->
        <div v-if="snippetsLoading" class="h-32 animate-pulse bg-ink-300"></div>

        <div
          v-else-if="snippetsFetchErrored || !sourceCodeMarkup"
          class="flex flex-col items-center justify-center gap-y-3 p-6"
        >
          <img
            src="~/assets/images/ui-states/no-accounts.png"
            alt="Fetching of source code snippets errored"
            class="h-8 w-10"
          />
          <p class="max-w-sm text-center text-xs text-vanilla-400">
            Could not load the source code snippet.
          </p>
        </div>

        <div v-else class="flex flex-col space-y-1">
          <div class="text-xs xl:text-sm">
            <z-code :content="sourceCodeMarkup" />
          </div>
        </div>
      </template>
    </z-accordion-item>
    <ignore-issue-intentional
      v-if="currentComponent === 'intentional'"
      :is-open="isOpen"
      :file-path="path"
      :check-issue-id="id"
      :shortcode="shortcode"
      @close="close"
      @ignore="markOccurrencesDisabled"
    />
    <ignore-issue-false-positive
      v-if="currentComponent === 'falsePositive'"
      :is-open="isOpen"
      :file-path="path"
      :shortcode="shortcode"
      :check-issue-id="id"
      @close="close"
      @ignore="markOccurrencesDisabled"
    />
    <ignore-issue-occurrence
      v-if="currentComponent === 'occurence'"
      :is-open="isOpen"
      :file-path="path"
      :check-issue-id="id"
      :shortcode="shortcode"
      :check-id="checkId"
      @close="close"
      @ignoreForever="markOccurrencesDisabled"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import {
  ZIcon,
  ZButton,
  ZCode,
  ZMenu,
  ZMenuItem,
  ZMenuSection,
  ZAccordionItem
} from '@deepsource/zeal'
import { safeRenderBackticks } from '~/utils/string'
import { toWrappableString } from '~/utils/string'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZCode,
    ZMenu,
    ZMenuItem,
    ZMenuSection,
    ZAccordionItem
  },
  methods: {
    safeRenderBackticks
  }
})
export default class IssueEditor extends Vue {
  @Prop()
  id: string

  @Prop()
  path: string

  @Prop()
  text: string

  @Prop()
  sourceCodeMarkup: string

  @Prop()
  beginLine!: number

  @Prop()
  endLine!: number

  @Prop()
  blobUrlRoot!: string

  @Prop()
  ignored!: string

  @Prop({ default: [] })
  checkIssueIds!: Array<string>

  @Prop()
  checkId!: string

  @Prop()
  shortcode!: string

  @Prop({ default: false })
  canIgnoreIssues: Boolean

  @Prop({ default: false })
  snippetsLoading: boolean

  @Prop({ default: false })
  snippetsFetchErrored: boolean

  isOpen = false
  currentComponent = ''
  isIgnored = false

  /**
   * Close the modal
   *
   * @returns {void}
   */
  close(): void {
    this.isOpen = false
  }

  /**
   * Open a particular modal instance to ignore the issue
   *
   * @param {string} name - name of the modal component
   * @returns {void}
   */
  openIgnoreIssueModal(name: string): void {
    this.currentComponent = name
    this.isOpen = true
  }

  /**
   * Ignore the current occurrence and refetch the check issues
   *
   * @param {Array<string>} checkIssueIds
   * @returns {void}
   */
  markOccurrencesDisabled(checkIssueIds: Array<string>): void {
    this.isIgnored = true
    this.close()
    this.$root.$emit('refetchCheck', this.checkId)
    this.$emit('ignoreIssues', checkIssueIds)
  }

  /**
   * Wrap the path to max of 100 chars
   *
   * @param {string} path
   * @returns {string}
   */
  getWrappablePath(path: string): string {
    return toWrappableString(path, 100)
  }

  get blobUrl(): string {
    /*
        Return the URL for this file with the lines highlighted on the repository's page on the VCS provider.
      */

    let provider = this.$providerMetaMap[this.$route.params.provider].value
    if (provider === 'GITHUB') {
      return `${this.blobUrlRoot}${this.path}#L${this.beginLine}-L${this.endLine}`
    } else if (provider === 'GITLAB') {
      return `${this.blobUrlRoot}${this.path}#L${this.beginLine}-${this.endLine}`
    } else if (provider === 'BITBUCKET') {
      return `${this.blobUrlRoot}${this.path}#lines-${this.beginLine}:${this.endLine}`
    }
    return ''
  }
}
</script>
