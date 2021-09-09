<template>
  <div
    class="border border-ink-200 rounded-md w-full"
    :class="{
      'opacity-60 pointer-events-none filter-grayscale':
        isIgnored || (checkIssueIds.length && checkIssueIds.includes(id))
    }"
  >
    <!-- heading -->
    <div class="grid gap-4 grid-cols-fr-8 p-3 bg-ink-300">
      <div class="flex flex-col space-y-1 rounded-md">
        <span class="font-medium text-vanilla-100 text-base">{{ text }}</span>
        <div class="grid grid-cols-2 xl:flex xl:space-x-4 items-center">
          <a
            class="text-vanilla-400 text-xs flex space-x-1 items-center"
            target="_blank"
            :href="blobUrl"
          >
            <z-icon icon="file-text" size="x-small" color="vanilla-400"></z-icon>
            <span>{{ path }}</span>
          </a>
          <div class="text-vanilla-400 text-xs flex space-x-1 items-center flex-1">
            <z-icon icon="eye" size="x-small"></z-icon>
            <span>Seen {{ lastSeen }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <z-menu v-if="canIgnoreIssues">
          <template v-slot:trigger="{ isOpen, toggle }">
            <z-button
              v-tooltip="'Ignore this occurance'"
              type="button"
              buttonType="ghost"
              icon="slash"
              iconColor="vanilla-400"
              size="small"
              class="focus:outline-none hover:bg-ink-200 -mt-1 -mr-1"
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
                ><span class="leading-6 overflow-ellipsis overflow-hidden"
                  >Ignore all occurrences in {{ path }}</span
                ></z-menu-item
              >
            </z-menu-section>
          </template>
        </z-menu>
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
      <div class="text-xs xl:text-sm word-break">
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
import '@deepsourcelabs/zeal/dist/zeal.css'

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
    return fromNow(this.modifiedAt)
  }

  public markOccurrencesDisabled(checkIssueIds: Array<string>): void {
    this.isIgnored = true
    this.close()
    this.$root.$emit('refetchCheck', this.checkId)
    this.$emit('ignoreIssues', checkIssueIds)
    this.$socket.$emit('ignore-issue-occurrence-file', checkIssueIds)
  }
}
</script>
