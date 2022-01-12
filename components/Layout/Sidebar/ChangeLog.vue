<template>
  <z-menu width="2x-large" placement="top" bodySpacing="p-0 border border-ink-200">
    <template v-slot:trigger="{ toggle }">
      <button
        type="button"
        class="flex items-center justify-center w-4 h-4 mb-2 mr-1 bg-opacity-50 rounded-full outline-none cursor-pointer focus:outline-none"
        :class="unseenCount > 0 ? 'bg-juniper' : 'bg-ink-200'"
        @click="
          () => {
            markAll()
            toggle()
          }
        "
        v-tooltip="helpText"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="unseenCount > 0 ? 'bg-juniper' : 'bg-ink-200'"
        ></div>
      </button>
    </template>
    <template slot="body">
      <div
        class="flex items-center justify-between px-4 py-2.5 border-b cursor-auto border-ink-200"
      >
        <span class="text-xs font-semibold text-vanilla-100"> Updates </span>
        <z-button
          type="link"
          buttonType="link"
          size="x-small"
          href="https://roadmap.deepsource.io/changelog"
          target="_blank"
          rel="noopener noreferrer"
          class="-mx-2 text-vanilla-400"
        >
          <z-icon
            icon="external-link"
            size="x-small"
            color="vanilla-400"
            class="mr-1.5 mb-0.5"
          ></z-icon>
          View all updates
        </z-button>
      </div>
      <div class="overflow-hidden overflow-y-scroll cursor-auto hide-scroll max-h-72">
        <a
          v-for="log in logEntries"
          :key="log.id"
          :href="log.url"
          target="blank"
          rel="noopener noreferrer"
          class="px-4 py-3.5 space-y-2 border-b border-ink-100 cursor-pointer hover:bg-ink-200 hover:bg-opacity-50 block"
          :class="{
            'bg-ink-200': !log.read
          }"
          @click="markRead(log)"
        >
          <h6 class="font-medium text-vanilla-100 -mt-1.5 pt-px">{{ log.title }}</h6>
          <div class="flex justify-between w-full align-baseline">
            <div class="flex items-center space-x-2">
              <z-tag
                v-for="label in log.labels"
                :key="label"
                spacing="px-2 py-1"
                textSize="xs"
                bgColor="ink-100"
                class="leading-none capitalize"
              >
                {{ label.name }}
              </z-tag>
            </div>
            <p class="text-vanilla-400 text-xxs mt-0.5">
              {{ log.publishedAt }}
            </p>
          </div>
        </a>
      </div>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Component, namespace } from 'nuxt-property-decorator'
import { ZMenu, ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { formatDate, parseISODate } from '@/utils/date'
import { Changelog, ChangelogItem, ChangelogItemLabel } from '~/types/types'
import { ContextActionTypes } from '~/store/account/context'

const contextStore = namespace('account/context')

export interface UIChangelogItem extends ChangelogItem {
  read: boolean
}

@Component({
  components: { ZMenu, ZButton, ZIcon, ZTag }
})
export default class ChangeLog extends Vue {
  @contextStore.State
  changelog: Changelog

  @contextStore.Action(ContextActionTypes.FETCH_CHANGELOG)
  fetchChangelog: () => Promise<void>

  public helpText = 'Latest updates'
  public logEntries: UIChangelogItem[] = []

  async fetch(): Promise<void> {
    await this.fetchChangelog()
    this.logEntries = (this.changelog.logEntries as ChangelogItem[]).map((log: ChangelogItem) => {
      return {
        id: log.id as string,
        read: this.isRead(log.id as string),
        title: log.title as string,
        status: log.status,
        url: log.url as string,
        labels: Array.isArray(log.labels) ? (log.labels as ChangelogItemLabel[]) : [],
        publishedAt: log.publishedAt ? formatDate(parseISODate(log.publishedAt as string)) : ''
      }
    })
  }

  get unseenCount(): number {
    const unReadLogs = this.logEntries.filter((item) => !item.read)
    return unReadLogs.length
  }

  getReadLogs(): string[] {
    const readLogs = this.$localStore.get('canny-change-log-items', 'read-values') as string[]
    return Array.isArray(readLogs) ? readLogs : []
  }

  isRead(id: string): boolean {
    const readLogs = this.getReadLogs()
    return readLogs.includes(id)
  }

  markRead(log: ChangelogItem) {
    const readLogs = this.getReadLogs()
    readLogs.push(log.id as string)
    this.$localStore.set('canny-change-log-items', 'read-values', [...new Set(readLogs)])

    this.logEntries = this.logEntries.map((item) => {
      if (item.id === log.id) {
        item.read = true
      }
      return item
    })
  }

  markAll() {
    const readLogs = this.getReadLogs()
    readLogs.push(...this.logEntries.map((item) => item.id as string))
    this.$localStore.set('canny-change-log-items', 'read-values', [...new Set(readLogs)])

    this.logEntries = this.logEntries.map((item) => {
      item.read = true
      return item
    })
  }
}
</script>
