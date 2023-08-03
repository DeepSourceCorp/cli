<template>
  <z-dialog-generic @onClose="$emit('close')">
    <template #default="{ close }">
      <div class="flex w-98 flex-col gap-y-4 p-4" @click.stop>
        <h3 class="text-sm font-medium leading-6 text-vanilla-100">
          Report has been successfully {{ editMode ? 'updated' : 'created' }}
        </h3>

        <z-alert v-if="password" type="warning" class="pt-2.5">
          <p class="inline-flex items-start gap-x-2.5 leading-6 tracking-snug">
            <z-icon icon="solid-alert-circle" color="honey-500" size="base" />
            Please make sure you've copied the password. You would not be able to see it again!
          </p>
        </z-alert>

        <label for="report-link" class="space-y-1.5">
          <p class="text-xs font-normal leading-5 text-vanilla-100">Report URL</p>
          <z-input
            id="report-link"
            :value="formattedUrl"
            :read-only="true"
            :show-border="false"
            placeholder="Report URL"
            class="border border-ink-200"
          >
            <template #right>
              <copy-button v-tooltip="'Copy public report link'" :value="formattedUrl" />
            </template>
          </z-input>
        </label>

        <label v-if="password" for="report-password" class="space-y-1.5">
          <p class="text-xs font-normal leading-5 text-vanilla-100">Password</p>
          <z-input
            id="report-password"
            :value="password"
            :read-only="true"
            :show-border="false"
            placeholder="Report password"
            class="border border-ink-200"
          >
            <template #right>
              <copy-button v-tooltip="'Copy password for the report'" :value="password" />
            </template>
          </z-input>
        </label>

        <div>
          <copy-button
            button-type="link"
            color="vanilla-400"
            icon-color="current"
            icon-size="x-small"
            label="Copy report details"
            succes-label="Report details copied"
            :value="reportDetails"
            class="float-left pl-1 hover:text-vanilla-100 hover:no-underline"
          />

          <z-button icon="check" size="small" label="Done" class="float-right" @click="close" />
        </div>
      </div>
    </template>
  </z-dialog-generic>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

/**
 * Success modal for report creation
 */
@Component({})
export default class CreateReportSuccess extends Vue {
  @Prop({ required: true })
  reportId: string

  @Prop({ default: '' })
  password: string

  @Prop({ default: false })
  editMode: boolean

  get formattedUrl(): string {
    return `${window.location.origin}/report/${this.reportId}`
  }

  get reportDetails(): string {
    return `View report -\nLink - ${this.formattedUrl}${
      this.password ? '\nPassword - ' + this.password : ''
    }`
  }
}
</script>
