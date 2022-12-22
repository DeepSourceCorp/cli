<template>
  <div>
    <z-accordion-item
      :is-open="true"
      span-custom-height
      custom-max-height="max-h-full"
      class="w-full border rounded-md border-slate-400"
      :class="{
        'opacity-60 pointer-events-none filter-grayscale transition transform-gpu duration-300 ease-in-out':
          isIgnored || (checkIssueIds.length && checkIssueIds.includes(id))
      }"
    >
      <!-- heading -->
      <template #title="{ open, toggleAccordion }">
        <div
          class="p-3 space-y-1 transition-all duration-100 border-b rounded-md bg-ink-300 border-slate-400"
          :class="open ? 'border-opacity-100 rounded-b-none' : 'border-opacity-0 delay-200'"
        >
          <div class="flex justify-between gap-x-2">
            <div
              v-tooltip="open ? 'Collapse code block' : 'Expand code block'"
              class="w-full space-y-1 cursor-pointer"
              @click="toggleAccordion"
            >
              <div class="flex flex-grow">
                <span
                  class="flex-grow text-base font-medium text-vanilla-100"
                  v-html="safeRenderBackticks(text)"
                />
              </div>
              <div
                class="items-center block space-y-1 sm:space-y-0 md:flex md:items-start md:space-x-4"
              >
                <a
                  :href="blobUrl"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="flex items-baseline text-xs truncate gap-x-2 text-vanilla-400"
                >
                  <span>
                    <z-icon
                      icon="file-text"
                      size="x-small"
                      color="vanilla-400"
                      class="flex-shrink-0 -mb-0.5"
                    />
                  </span>
                  <span
                    class="flex flex-wrap items-baseline max-w-lg"
                    v-html="getWrappablePath(path)"
                  ></span>
                </a>
              </div>
            </div>

            <div class="flex justify-end w-12">
              <z-menu v-if="canIgnoreIssues">
                <template #trigger="{ isOpen, toggle }">
                  <z-button
                    v-tooltip="'Ignore this occurrence'"
                    type="button"
                    button-type="ghost"
                    icon="slash"
                    icon-color="vanilla-400"
                    size="small"
                    class="-mt-1 -mr-1 focus:outline-none hover:bg-ink-200"
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
                      ><span class="overflow-hidden leading-6 overflow-ellipsis"
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
        <div class="flex flex-col space-y-1">
          <div class="text-xs xl:text-sm">
            <z-code :content="sourceCodeMarkup" />
          </div>
        </div>
      </template>
    </z-accordion-item>
    <ignore-issue-intentional
      v-if="currentComponent === 'intentional'"
      :isOpen="isOpen"
      :filePath="path"
      :checkIssueId="id"
      :shortcode="shortcode"
      @close="close"
      @ignore="markOccurrencesDisabled"
    ></ignore-issue-intentional>
    <ignore-issue-false-positive
      v-if="currentComponent === 'falsePositive'"
      :isOpen="isOpen"
      :filePath="path"
      :shortcode="shortcode"
      :checkIssueId="id"
      @close="close"
      @ignore="markOccurrencesDisabled"
    ></ignore-issue-false-positive>
    <ignore-issue-occurrence
      v-if="currentComponent === 'occurence'"
      :isOpen="isOpen"
      :filePath="path"
      :checkIssueId="id"
      :shortcode="shortcode"
      :checkId="checkId"
      @close="close"
      @ignoreForever="markOccurrencesDisabled"
    ></ignore-issue-occurrence>
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
import { fromNow } from '~/utils/date'
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
