<template>
  <div
    class="w-full border rounded-md border-ink-200"
    :class="{
      'opacity-60 pointer-events-none filter-grayscale':
        isIgnored || (checkIssueIds.length && checkIssueIds.includes(id))
    }"
  >
    <!-- heading -->
    <div class="p-3 space-y-1 bg-ink-300">
      <div class="flex justify-between">
        <span class="flex-grow text-base font-medium text-vanilla-100">{{ text }}</span>
        <div class="flex justify-end w-12">
          <z-menu v-if="canIgnoreIssues">
            <template v-slot:trigger="{ isOpen, toggle }">
              <z-button
                v-tooltip="'Ignore this occurance'"
                type="button"
                buttonType="ghost"
                icon="slash"
                iconColor="vanilla-400"
                size="small"
                class="-mt-1 -mr-1 focus:outline-none hover:bg-ink-200"
                :class="isOpen ? 'bg-ink-200' : ''"
                @click="toggle"
              />
            </template>
            <template slot="body">
              <z-menu-section>
                <z-menu-item @click="() => openIgnoreIssueModal('intentional')"
                  >This is intentional</z-menu-item
                >
                <z-menu-item @click="() => openIgnoreIssueModal('falsePositive')"
                  ><span class="text-cherry">This is a false-positive</span></z-menu-item
                >
              </z-menu-section>
              <z-menu-section title="Other actions" :divider="false" class="text-left">
                <z-menu-item @click="() => openIgnoreIssueModal('occurence')"
                  ><span class="overflow-hidden leading-6 overflow-ellipsis"
                    >Ignore all occurrences in {{ path }}</span
                  ></z-menu-item
                >
              </z-menu-section>
            </template>
          </z-menu>
        </div>
      </div>
      <div class="items-center block space-y-1 sm:space-y-0 md:flex md:items-start md:space-x-4">
        <a
          class="flex items-baseline space-x-1 text-xs truncate text-vanilla-400"
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
        <span v-if="lastSeen" class="flex items-center flex-1 space-x-1 text-xs text-vanilla-400">
          <z-icon class="flex-shrink-0" icon="eye" size="x-small"></z-icon>
          <span class="flex-shrink-0">Seen {{ lastSeen }}</span>
        </span>
      </div>
    </div>
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
    <!-- Code -->
    <div class="flex flex-col space-y-1">
      <div class="text-xs xl:text-sm">
        <z-code :content="sourceCodeMarkup"></z-code>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZCode, ZMenu, ZMenuItem, ZMenuSection, ZModal } from '@deepsourcelabs/zeal'
import {
  IgnoreIssueIntentional,
  IgnoreIssueFalsePositive,
  IgnoreIssueOccurrence
} from '@/components/RepoIssues'
import { fromNow } from '~/utils/date'
import { toWrappableString } from '~/utils/string'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZCode,
    ZMenu,
    ZMenuItem,
    ZMenuSection,
    ZModal,
    IgnoreIssueIntentional,
    IgnoreIssueFalsePositive,
    IgnoreIssueOccurrence
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
  modifiedAt: string

  @Prop()
  createdAt: string

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

  public isOpen = false

  public currentComponent = ''

  public isIgnored = false

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

  public close(): void {
    this.isOpen = false
  }

  public openIgnoreIssueModal(name: string): void {
    this.currentComponent = name
    this.isOpen = true
  }

  get lastSeen(): string {
    if (this.createdAt) return fromNow(this.createdAt)
    if (this.modifiedAt) return fromNow(this.modifiedAt)
    return ''
  }

  public markOccurrencesDisabled(checkIssueIds: Array<string>): void {
    this.isIgnored = true
    this.close()
    this.$root.$emit('refetchCheck', this.checkId)
    this.$emit('ignoreIssues', checkIssueIds)
    this.$socket.$emit('ignore-issue-occurrence-file', checkIssueIds)
  }

  public getWrappablePath(path: string): string {
    return toWrappableString(path, 100)
  }
}
</script>
