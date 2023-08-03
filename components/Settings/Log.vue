<template>
  <div class="min-h-12 space-y-3">
    <p class="hyphens-auto break-words leading-5 text-vanilla-100 before:lh-crop-5">
      {{ eventDescription }}
    </p>

    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-vanilla-400">
      <code class="bifrost-inline-code text-vanilla-100">{{ eventName }}</code>

      <div v-if="ipAddress" class="flex items-center gap-x-2">
        <z-icon icon="network" size="x-small" />
        {{ ipAddress }}
      </div>

      <div v-if="actor" class="flex items-center gap-x-2">
        <z-avatar
          :image="actor.avatar"
          :fallback-image="getDefaultAvatar(actor.email)"
          :user-name="actorName"
          size="xs"
          class="flex-shrink-0"
        />

        <span v-tooltip="actor.email">{{ actorName }}</span>
      </div>

      <div class="flex items-center gap-x-2">
        <z-icon icon="clock" size="x-small" />
        <span v-tooltip="formattedDate">{{ formatDuration }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { formatDate, fromNow, parseISODate } from '@/utils/date'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  methods: {
    getDefaultAvatar
  }
})
export default class Log extends Vue {
  @Prop()
  actor!: Record<string, string>

  @Prop()
  eventName!: string

  @Prop()
  description!: string

  @Prop()
  createdAt!: string

  @Prop()
  location!: string

  @Prop()
  ipAddress!: string

  get eventDescription(): string {
    if (this.description.endsWith('.')) {
      return this.description.substring(0, this.description.length - 1)
    }

    return this.description
  }

  get actorName(): string {
    if (this.actor?.fullName) {
      return this.actor.fullName
    }
    if (this.actor?.firstName) {
      return this.actor.firstName
    }
    if (this.actor?.email) {
      return this.actor.email
    }
    return ''
  }

  get formattedDate(): string {
    return formatDate(parseISODate(this.createdAt), 'lll')
  }

  get formatDuration(): string {
    return fromNow(this.createdAt)
  }
}
</script>
