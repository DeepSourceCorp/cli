<template>
  <z-menu width="2x-large">
    <template v-slot:trigger="{ isOpen }">
      <button class="hover:bg-ink-300 rounded-md p-2" :class="{ 'bg-ink-300': isOpen }">
        <z-icon icon="bell" color="vanilla-400"></z-icon>
      </button>
    </template>
    <template slot="body">
      <div
        class="flex items-center justify-between pr-1 pl-4 pb-1 border-b border-ink-200 cursor-auto"
      >
        <span class="text-vanilla-400 text-xs font-medium uppercase tracking-wider">
          Your Notifications
        </span>
        <z-button
          :class="{
            invisible: !hasNotifications
          }"
          icon="mail"
          size="small"
          buttonType="ghost"
        >
          Mark all as read
        </z-button>
      </div>
      <div
        class="overflow-scroll p-1.5 space-y-1 cursor-auto"
        :class="isExpanded ? 'h-102' : 'h-72'"
      >
        <template v-if="hasNotifications">
          <div v-for="idx in 10" :key="idx" class="bg-ink-200 rounded-md flex p-2">
            <div class="w-10">
              <z-avatar
                image="https://randomuser.me/api/portraits/men/75.jpg"
                user-name="Example"
              ></z-avatar>
            </div>
            <div class="text-xs space-y-2">
              <p class="text-vanilla-100">
                <b>John Doe</b> invited you to join the organization <b>SpaceX</b>
              </p>
              <p class="text-vanilla-400">41 minutes ago</p>
            </div>
          </div>
        </template>
        <div v-else class="flex items-center text-center w-72 mx-auto h-full">
          <div class="space-y-2">
            <span class="text-4xl">📭</span>
            <h4 class="font-semibold text-center text-base">No notifications yet</h4>
            <p class="text-vanilla-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam amet non convallis.
            </p>
          </div>
        </div>
      </div>
      <div v-if="hasNotifications" class="border-t border-ink-200 p-1.5 pb-0">
        <z-button
          class="text-vanilla-200"
          size="small"
          buttonType="secondary"
          :fullWidth="true"
          @click="toggleMore"
        >
          <template v-if="isExpanded"> Collapse </template>
          <template v-else> Show {{ count }} more unread notifications </template>
          <z-icon
            class="ml-1 transform-gpu duration-200"
            icon="chevron-down"
            :class="isExpanded ? 'rotate-180' : ''"
          ></z-icon>
        </z-button>
      </div>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZMenu, ZButton, ZIcon, ZAvatar } from '@deepsourcelabs/zeal'

@Component({
  components: { ZMenu, ZButton, ZIcon, ZAvatar }
})
export default class Notifications extends Vue {
  private count = 23
  private isExpanded = false

  toggleMore(): void {
    this.isExpanded = !this.isExpanded
  }

  get hasNotifications(): boolean {
    return true
  }
}
</script>
