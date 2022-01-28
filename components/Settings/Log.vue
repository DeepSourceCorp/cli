<template>
  <div class="flex flex-col space-y-2">
    <div class="text-md text-vanilla-400">
      <span class="font-semibold text-vanilla-100">{{ eventDescription }}</span>
      <template v-if="actorName"> — {{ actorName }} </template>
    </div>
    <div class="flex space-x-4">
      <info v-tooltip="formattedDate" v-if="createdAt" icon="clock" :title="formatDuration"></info>
      <info v-if="location" icon="map-pin" :title="location"></info>
      <info v-if="ipAddress" icon="globe" :title="ipAddress"></info>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { fromNow, formatDate, parseISODate } from '@/utils/date'
import { Info } from '@/components/Autofix/index'

@Component({
  components: {
    Info
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
