<template>
  <base-card :to="`/report/${reportId}`" target="_blank" rel="noopener noreferrer">
    <template slot="title">
      <span class="text-base flex items-center gap-x-2 mb-2">
        <z-icon :icon="isRestricted ? 'file-lock' : 'file-bar-chart'" color="vanilla-100" />
        <span>{{ label }}</span>
      </span>
    </template>
    <template slot="description">
      <p class="flex items-center gap-x-4 text-sm">
        <meta-data-item icon="eye">
          {{ views }} {{ views === 1 ? 'view' : 'views' }}
        </meta-data-item>
        <meta-data-item icon="clock">
          Created on {{ formatDate(parseISODate(this.createdAt), 'll') }}
        </meta-data-item>
      </p>
    </template>
    <template slot="info">
      <div class="flex items-center justify-around h-full">
        <z-button
          v-tooltip="'Edit report'"
          icon="edit"
          button-type="ghost"
          icon-color="vanilla-400 opacity-75"
          size="small"
          @click.prevent="$emit('edit', reportId)"
        />
        <z-button
          v-tooltip="'Delete report'"
          icon="trash-2"
          button-type="ghost"
          icon-color="cherry opacity-75"
          size="small"
          @click.prevent="$emit('delete', reportId, label)"
        />
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { formatDate, parseISODate } from '@/utils/date'

/**
 * Card component for public reports
 */
@Component({
  components: {
    ZButton,
    ZIcon
  },
  methods: {
    formatDate,
    parseISODate
  }
})
export default class PublicReportCard extends Vue {
  @Prop({ required: true })
  reportId: string

  @Prop({ required: true })
  label: string

  @Prop({ required: true })
  createdAt: string

  @Prop({ default: false })
  isRestricted: boolean

  @Prop({ default: 0 })
  views: number
}
</script>
