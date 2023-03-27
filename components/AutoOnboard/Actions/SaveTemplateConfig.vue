<template>
  <div>
    <z-button
      :disabled="disabled"
      size="small"
      button-type="primary"
      icon="save"
      @click="openModal"
    >
      Save template
    </z-button>
    <portal to="modal">
      <z-modal v-if="isSaveModalVisible" title="Confirm save" @onClose="isSaveModalVisible = false">
        <fieldset class="space-y-4 p-4">
          <div class="space-y-2">
            <label for="title" class="text-vanilla-200 text-sm">Template name</label>
            <z-input
              id="Title"
              v-model="internalTitle"
              placeholder="Template name"
              required="true"
            />
          </div>
          <div class="space-y-2">
            <label for="desc" class="text-vanilla-200 text-sm">Description</label>
            <textarea
              v-model="internalDescription"
              name="desc"
              required="true"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              class="w-full h-full p-2 text-sm rounded-sm bg-ink-400 border outline-none resize-none min-h-20 border-slate-400 focus:border-vanilla-400 text-vanilla-200"
              placeholder="Description for this template can include the analyzers available in this and the projects this template is best suited for"
            ></textarea>
          </div>
        </fieldset>
        <template #footer="{ close }">
          <div class="p-4 space-x-4 text-right text-vanilla-100 border-slate-400">
            <z-button
              :icon="savingConfig ? 'animate-spin' : 'autofix'"
              :icon-color="savingConfig ? 'ink animate-spin' : ''"
              class="modal-primary-action w-48"
              button-type="primary"
              size="small"
              :disabled="savingConfig"
              @click="updateConfig(close)"
            >
              {{ savingConfig ? 'Updating' : 'Update' }} template
            </z-button>
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, Watch, Inject } from 'nuxt-property-decorator'
import { ZInput, ZTextarea, ZButton, ZModal } from '@deepsource/zeal'

import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { RepoConfigInterface } from '~/store/repository/detail'

@Component({
  components: {
    ZInput,
    ZModal,
    ZTextarea,
    ZButton
  }
})
export default class SaveTemplateConfig extends mixins(
  AutoOnboardMixin,
  ActiveUserMixin,
  OwnerDetailMixin
) {
  @Prop()
  title: string

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  readOnly: boolean

  @Prop()
  description: string

  @Prop()
  templateConfig: RepoConfigInterface

  public savingConfig = false
  public isSaveModalVisible = false
  public internalTitle = ''
  public internalDescription = ''

  @Watch('title', { immediate: true })
  @Watch('description', { immediate: true })
  syncData() {
    this.internalTitle = this.title
    this.internalDescription = this.description
  }

  get baseConfig(): {
    title: string
    description: string
    config: string
  } {
    return {
      title: this.internalTitle,
      description: this.internalDescription,
      config: JSON.stringify(this.templateConfig)
    }
  }

  async updateConfig(close: () => void): Promise<void> {
    if (!this.internalTitle) {
      this.$toast.info('Please enter a title for this template')
      return
    }
    this.savingConfig = true
    try {
      const { shortcode } = this.$route.params
      const res = await this.updateConfigTemplate({
        ...this.baseConfig,
        shortcode: shortcode
      })
      if (res.ok) {
        await this.refetch(shortcode)
        this.$toast.success('Config template saved successfully')
        this.$emit('refetch')
        close()
      } else {
        throw new Error('Unable to update config template')
      }
    } catch (e) {
      this.$toast.danger(
        'There was a problem updating this config, please check your config for errors or contact support.'
      )
      this.logErrorForUser(e, 'Auto Onboard template update', this.baseConfig)
    } finally {
      this.savingConfig = false
    }
  }

  async refetch(shortcode?: string): Promise<void> {
    const { provider, owner } = this.$route.params
    await this.refetchTemplateList()
    if (shortcode) {
      await this.fetchSingleTemplate({
        provider,
        shortcode,
        login: owner,
        refetch: true
      })
    }
  }

  @Inject('validateConfigForAnalyzers')
  validateConfigForAnalyzers: () => boolean

  openModal() {
    const validity = this.validateConfigForAnalyzers()
    if (validity) {
      this.isSaveModalVisible = true
    } else {
      this.$toast.danger(
        "Your configuration is invalid, please ensure you've filled all required fields"
      )
    }
  }
}
</script>
