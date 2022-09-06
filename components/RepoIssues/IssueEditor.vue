<template>
  <div>
    <z-accordion-item
      :is-open="openAccordion"
      class="w-full border rounded-md border-ink-200"
      :class="{
        'opacity-60 pointer-events-none filter-grayscale transition transform-gpu duration-300 ease-in-out':
          isIgnored || (checkIssueIds.length && checkIssueIds.includes(id))
      }"
    >
      <!-- heading -->
      <template v-slot:title="{ open, toggleAccordion }">
        <div
          class="p-3 space-y-1 transition-all duration-100 border-b rounded-md bg-ink-300 border-ink-200"
          :class="open ? 'border-opacity-100 rounded-b-none' : 'border-opacity-0 delay-200'"
        >
          <div class="flex justify-between md:items-center gap-x-2">
            <div class="space-y-1">
              <div class="flex flex-grow cursor-pointer" @click="toggleAccordion">
                <button
                  v-tooltip="open ? 'Collapse code block' : 'Expand code block'"
                  class="grid h-6 pr-1 place-content-center"
                >
                  <z-icon
                    icon="chevron-up"
                    class="transition-all duration-300 ease-in-out transform"
                    :class="[open ? 'rotate-0' : 'rotate-180']"
                  />
                </button>
                <span
                  class="flex-grow text-base font-medium text-vanilla-100"
                  v-html="safeRenderBackticks(text)"
                />
              </div>
              <div
                class="items-center block space-y-1 sm:space-y-0 md:flex md:items-start md:space-x-4"
              >
                <a
                  class="flex items-baseline text-xs truncate gap-x-2 text-vanilla-400"
                  target="_blank"
                  rel="noreferrer noopener"
                  :href="blobUrl"
                >
                  <span>
                    <z-icon
                      icon="file-text"
                      size="x-small"
                      class="flex-shrink-0 -mb-0.5"
                      color="vanilla-400"
                    ></z-icon>
                  </span>
                  <span
                    v-html="getWrappablePath(path)"
                    class="flex flex-wrap items-baseline max-w-lg"
                  ></span>
                </a>
              </div>
            </div>

            <div class="flex justify-end w-12">
              <z-menu v-if="canIgnoreIssues">
                <template v-slot:trigger="{ isOpen, toggle }">
                  <z-button
                    v-tooltip="'Ignore this occurrence'"
                    type="button"
                    buttonType="ghost"
                    icon="slash"
                    iconColor="vanilla-400"
                    size="small"
                    class="focus:outline-none hover:bg-ink-200"
                    :class="isOpen ? 'bg-ink-200' : ''"
                    @click="toggle"
                  />
                </template>
                <template slot="body">
                  <z-menu-section>
                    <z-menu-item @click="openIgnoreIssueModal('intentional')"
                      >This is intentional</z-menu-item
                    >
                    <z-menu-item @click="openIgnoreIssueModal('falsePositive')"
                      ><span class="text-cherry">This is a false-positive</span></z-menu-item
                    >
                  </z-menu-section>
                  <z-menu-section title="Other actions" :divider="false" class="text-left">
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
            <z-code :content="sourceCodeMarkup"></z-code>
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
} from '@deepsourcelabs/zeal'
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

  @Prop({ default: true })
  openAccordion: Boolean

  isOpen = false
  currentComponent = ''
  isIgnored = false

  /**
   * Close the modal
   *
   * @return {void}
   */
  close(): void {
    this.isOpen = false
  }

  /**
   * Open a particular modal instance to ignore the issue
   *
   * @param {string} name - name of the modal component
   *
   * @return {void}
   */
  openIgnoreIssueModal(name: string): void {
    this.currentComponent = name
    this.isOpen = true
  }

  /**
   * Ignore the current occurence and refectch the check issues
   *
   * @param {Array<string>} checkIssueIds
   *
   * @return {void}
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
   *
   * @return {string}
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
