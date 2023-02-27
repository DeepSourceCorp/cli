<template>
  <z-modal title="Delete SSO configuration" @onClose="$emit('close')">
    <template #default="{ close }">
      <div class="p-4">
        <template v-if="step === 0">
          <p class="text-vanilla-100 text-sm leading-5">
            Are you sure you want to delete your SSO configuration? Deleting your configuration
            would:
          </p>
          <ul class="mt-3 text-vanilla-100 text-sm leading-5 space-y-6">
            <li class="flex items-baseline gap-x-1.5">
              <div>
                <z-icon
                  icon="alert-circle"
                  color="cherry"
                  size="small"
                  class="-mb-1 flex-shrink-0"
                />
              </div>
              <span>
                Remove your verified domain and you would have to manually get it re-verified again.
              </span>
            </li>
            <li class="flex items-baseline gap-x-1.5">
              <div>
                <z-icon
                  icon="alert-circle"
                  color="cherry"
                  size="small"
                  class="-mb-1 flex-shrink-0"
                />
              </div>
              <span>Sign out all your team members.</span>
            </li>
          </ul>
          <div class="mt-7 text-right">
            <z-button button-type="danger" size="small" @click="step = 1">
              <div class="inline-flex items-center gap-x-1.5">
                <span>I understand, continue to delete</span>
                <z-icon icon="arrow-right" color="current" size="small" />
              </div>
            </z-button>
          </div>
        </template>
        <template v-else>
          <div class="px-2 py-2.5 bg-cherry bg-opacity-10 rounded-md">
            <div class="flex gap-x-2 items-center">
              <z-icon icon="solid-alert-circle" color="cherry-500" size="x-small" />
              <span class="text-xs leading-6 text-cherry-400"
                >This action is irreversible and cannot be undone.</span
              >
            </div>
          </div>
          <div class="mt-4 text-xs leading-5 text-vanilla-100">
            Please type your email address to confirm deletion
          </div>
          <z-input
            v-model="userEmail"
            placeholder="Enter your email address"
            size="small"
            class="mt-2"
          />
          <div class="mt-4 text-right">
            <z-button
              :is-loading="isDeleting"
              :disabled="isDeleting || !deletionValid"
              icon="trash-2"
              button-type="danger"
              size="small"
              label="Delete configuration"
              loading-label="Deleting configuration"
              class="modal-primary-action"
              @click="emitDelete(close)"
            />
          </div>
        </template>
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZInput, ZModal } from '@deepsource/zeal'
import { User } from '~/types/types'

@Component({ components: { ZButton, ZIcon, ZInput, ZModal } })
export default class ConfirmDeleteIdP extends Vue {
  @Prop({ required: true })
  viewer: User

  @Prop({ default: false, type: Boolean })
  isDeleting: boolean

  userEmail = ''
  step = 0

  get deletionValid(): boolean {
    return this.viewer.email === this.userEmail
  }

  emitDelete(close: () => void) {
    if (this.deletionValid) {
      this.$emit('delete-idp', { close })
    }
  }
}
</script>
