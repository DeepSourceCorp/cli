<template>
  <z-menu width="2x-large" placement="top" bodySpacing="p-0 border border-ink-200">
    <template slot="trigger">
      <div
        class="flex items-center justify-center w-4 h-4 mb-2 bg-opacity-50 rounded-full cursor-pointer"
        :class="unseenCount > 0 ? 'bg-juniper' : 'bg-ink-200'"
        @click="markAll"
        v-tooltip="helpText"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="unseenCount > 0 ? 'bg-juniper' : 'bg-ink-200'"
        ></div>
      </div>
    </template>
    <template slot="body">
      <div class="flex items-center justify-between p-2 pl-3 border-b cursor-auto border-ink-200">
        <span class="text-xs font-semibold text-vanilla-100"> Updates </span>
        <a href="https://changelog.deepsource.io/" target="_blank" rel="noopener noreferrer">
          <z-button class="text-vanilla-400 flex items-center" size="x-small" buttonType="ghost">
            <z-icon
              icon="external-link"
              size="x-small"
              color="vanilla-400"
              class="mr-1.5 mb-0.5"
            ></z-icon>
            View all updates
          </z-button>
        </a>
      </div>
      <div class="hide-scroll overflow-hidden overflow-y-scroll cursor-auto h-72">
        <a
          v-for="log in changeLog"
          :key="log.id"
          :href="log.url"
          @click="() => markRead(log)"
          target="blank"
          rel="noopener noreferrer"
          class="p-2 space-y-2 border-b border-ink-100 cursor-pointer hover:bg-ink-200 hover:bg-opacity-50 block"
          :class="{
            'bg-ink-200': !log.read
          }"
        >
          <div class="flex items-center justify-between space-x-2 text-xs">
            <div class="flex items-center space-x-1">
              <z-tag
                v-for="category in log.categories"
                :key="category"
                spacing="px-2 py-1 leading-none"
                textSize="xs"
                bgColor="ink-100"
                >{{ category }}</z-tag
              >
            </div>
            <p class="text-vanilla-400">{{ fromNow(log.dateTime) }}</p>
          </div>
          <p class="text-vanilla-100 text-xs font-medium">
            {{ log.content.short }}
          </p>
        </a>
      </div>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZMenu, ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { fromNow } from '@/utils/date'

export interface ChangeLogItem {
  categories: string[]
  content: {
    short: string
    long: string
    more: boolean
  }
  dateTime: Date
  id: number
  read: boolean
  seen: boolean
  title: string
  url: string
}

declare global {
  interface Window {
    HW_config: Record<string, unknown>
    Headway: Headway
  }
}

export interface Headway {
  init?: () => void
  getChangelogs?: () => ChangeLogItem[]
  markAllSeen?: () => void
  markSeen?: (id: number) => void
  markRead?: (id: number) => void
}

@Component({
  components: { ZMenu, ZButton, ZIcon, ZTag }
})
export default class ChangeLog extends Vue {
  public helpText = 'Latest updates'
  public changeLog: ChangeLogItem[] = []
  public fromNow = fromNow
  public widget: Headway = {}
  public currentLog: ChangeLogItem | undefined = undefined

  async created(): Promise<void> {
    window.HW_config = {
      selector: '#changelog-badge',
      trigger: '#changelog-badge',
      account: 'J5gV6x',
      autorefresh: true,
      apiMode: true,
      callbacks: {
        onWidgetUpdate: (widget: Headway) => {
          if (widget.getChangelogs) {
            this.changeLog = widget.getChangelogs()
          }
          this.widget = widget
        }
      }
    }

    this.injectWrapper()

    await this.injectScript()
  }

  injectWrapper(): void {
    const wrapper = document.createElement('div')
    wrapper.id = 'changelog-badge'
    wrapper.classList.add('hidden', 'h-0', 'w-0')
    document.body.appendChild(wrapper)
  }

  async injectScript(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.headwayapp.co/widget.js'
      script.defer = true
      script.addEventListener('load', resolve)
      script.addEventListener('error', (e) => reject(e.error))
      document.head.appendChild(script)
    })
  }

  get unseenCount(): number {
    return this.changeLog.filter((log) => !log.seen).length
  }

  markRead(log: ChangeLogItem) {
    if (this.widget.markRead) {
      this.widget.markRead(log.id)
    }
    log.read = true
  }

  markAll() {
    if (this.widget.markAllSeen) {
      this.widget.markAllSeen()
    }

    this.changeLog.forEach((log) => {
      log.seen = true
    })
  }

  updateChangeLog(): void {
    if (this.widget.getChangelogs) {
      try {
        this.changeLog = this.widget.getChangelogs()
      } catch (e) {
        setTimeout(() => {
          this.updateChangeLog()
        }, 2000)
      }
    }
  }
}
</script>
