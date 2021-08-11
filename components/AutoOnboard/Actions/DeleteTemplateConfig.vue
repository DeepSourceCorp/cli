<template>
  <div>
    <z-button
      @click="showConfirmDelete = true"
      size="small"
      buttonType="ghost"
      iconColor="cherry"
      v-tooltip="'Delete template'"
      icon="trash-2"
    >
    </z-button>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDelete"
        title="Are you sure you want to delete this template?"
        subtitle="Once deleted, you won't be able to restore this template"
        @onClose="showConfirmDelete = false"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              icon="trash-2"
              class="modal-primary-action"
              buttonType="danger"
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
import { ZConfirm, ZButton } from '@deepsourcelabs/zeal'

import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: {
    ZConfirm,
    ZButton
  }
})
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
      this.logSentryErrorForUser(e, 'AutoOnboard template deletion', {
        shortcode
      })
    } finally {
      this.deletingConfig = false
    }
  }
}
</script>
