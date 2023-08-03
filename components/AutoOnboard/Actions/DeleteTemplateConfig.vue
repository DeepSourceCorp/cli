<template>
  <div>
    <z-button
      v-tooltip="'Delete template'"
      size="small"
      button-type="ghost"
      icon-color="cherry"
      icon="trash-2"
      @click="showConfirmDelete = true"
    />
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDelete"
        title="Are you sure you want to delete this template?"
        subtitle="Once deleted, you won't be able to restore this template"
        @onClose="showConfirmDelete = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              icon="trash-2"
              class="modal-primary-action"
              button-type="danger"
              size="small"
              @click="deleteTemplate(close)"
              >Yes, delete this template</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'

import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({})
export default class SaveTemplateConfig extends mixins(AutoOnboardMixin, ActiveUserMixin) {
  @Prop()
  title: string

  public deletingConfig = false
  public showConfirmDelete = false

  async deleteTemplate(close: () => void): Promise<void> {
    const { shortcode } = this.$route.params
    this.deletingConfig = true
    try {
      const res = await this.deleteConfigTemplate({
        shortcode
      })

      if (res.ok) {
        this.$toast.success('Deleted the template successfully')
        await this.refetchTemplateList()
        this.$router.push(this.$generateRoute(['settings', 'auto-onboard']))
        close()
      } else {
        throw new Error('Unable to delete config template')
      }
    } catch (e) {
      this.$toast.danger('There was a problem deleting this config')
      this.logErrorForUser(e as Error, 'Auto Onboard template deletion', {
        shortcode
      })
    } finally {
      this.deletingConfig = false
    }
  }
}
</script>
