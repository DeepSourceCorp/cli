<template>
  <z-modal :title="`SCIM token for ${teamName}`" @onClose="$emit('close')">
    <div class="space-y-5 px-4 py-4.5">
      <label class="space-y-2">
        <div class="text-xs leading-normal text-vanilla-100">
          Use this token to set up SCIM with your identity provider
        </div>
        <z-input
          :value="token"
          :read-only="true"
          :show-border="false"
          placeholder="SCIM token"
          class="border border-ink-200"
        >
          <template #right>
            <copy-button v-tooltip="'Copy token'" :value="token" />
          </template>
        </z-input>
      </label>

      <z-alert type="warning">
        <div class="flex gap-x-2 text-xs">
          <z-icon
            icon="solid-alert-circle"
            color="current"
            size="x-small"
            class="mt-0.5 flex-shrink-0"
          />
          <span
            >Make sure to copy your SCIM token now. You will not be able to see it again. You will
            always be able to regenerate a new token.</span
          >
        </div>
      </z-alert>
    </div>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class ShowScimToken extends Vue {
  @Prop({ required: true })
  token: string

  @Prop({ required: true })
  teamName: string
}
</script>
