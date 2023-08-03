<template>
  <z-modal title="Create new template" width="wide" @onClose="$emit('close')">
    <div class="h-102 overflow-y-scroll">
      <fieldset class="space-y-4 p-4">
        <div>
          <label for="title" class="sr-only mb-2 text-sm text-vanilla-200">Template name</label>
          <z-input id="Title" v-model="title" placeholder="Template name" required="true" />
        </div>
        <div>
          <label for="desc" class="sr-only mb-2 text-sm text-vanilla-200">Description</label>
          <textarea
            v-model="description"
            name="desc"
            required="true"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            class="h-full min-h-20 w-full resize-none rounded-sm border border-slate-400 bg-ink-400 p-2 text-sm text-vanilla-200 outline-none focus:border-vanilla-400"
            placeholder="Add a short description of this template to explain where it can be used."
          ></textarea>
        </div>
      </fieldset>
      <section class="px-4">
        <analyzer-search
          ref="analyzer-search-component"
          class="mb-3"
          dropdown-bg-class="bg-ink-100"
          :selected-analyzers="selectedAnalyzers"
          :toggle-search="showAnalyzerList"
          :close-on-add="true"
          @addAnalyzer="addAnalyzer"
          @closeSearch="showAnalyzerList = false"
        />
        <div v-if="activeAnalyzers.length" class="space-y-3">
          <analyzer
            v-for="analyzer in activeAnalyzers"
            :key="analyzer.shortcode"
            class="z-20 border border-slate-400"
            v-bind="analyzer"
            :for-template="true"
            :analyzer-meta="analyzer.meta"
            :available-transformers="analyzer.transformers"
            :selected-analyzer="getConfig(analyzer.shortcode)"
            :selected-transformers="templateConfig.transformers"
            @onClose="removeAnalyzer(analyzer)"
            @analyzersUpdated="syncAnalyzer"
            @transformersUpdated="syncTransformers"
          />
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="loopIndex in 3"
            :key="loopIndex"
            class="h-10 space-y-3 border-2 border-dashed border-current p-3 text-ink-100"
          ></div>
        </div>
      </section>
    </div>
    <template #footer="{ close }">
      <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
        <z-button
          :icon="savingConfig ? 'spin-loader' : 'autofix'"
          :icon-color="savingConfig ? 'ink animate-spin' : ''"
          class="modal-primary-action w-48"
          button-type="primary"
          size="small"
          :disabled="savingConfig"
          @click="saveConfig(close)"
        >
          {{ savingConfig ? 'Creating' : 'Create' }} template
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import ConfigGeneratorMixin from '~/mixins/configGeneratorMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import { RepoConfigAnalyzerMeta, RepoConfigInterface } from '~/store/repository/detail'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({})
export default class NewOnboardingTemplateModal extends mixins(
  ConfigGeneratorMixin,
  OwnerDetailMixin,
  AutoOnboardMixin,
  ActiveUserMixin
) {
  public title = ''
  public description = ''
  public showAnalyzerList = false
  public savingConfig = false

  get baseConfig(): {
    title: string
    description: string
    config: string
  } {
    return {
      title: this.title,
      description: this.description,
      config: JSON.stringify(this.templateConfig)
    }
  }

  async saveConfig(close: () => void): Promise<void> {
    let isDirty = false
    if (!this.title) {
      this.$toast.info('Please enter a title before submitting')
      isDirty = true
    }

    if (this.templateConfig.analyzers.length === 0) {
      this.$toast.info('Please add at least one analyzer before submitting')
      isDirty = true
    }

    if (isDirty) {
      return
    }

    this.savingConfig = true
    try {
      const res = await this.createConfigTemplate({
        ownerId: this.owner.id,
        ...this.baseConfig
      })
      await this.refetch(res.template?.shortcode)

      this.$toast.success('Config template saved successfully')
      this.$router.push(this.$generateRoute(['settings', 'auto-onboard']))
      close()
    } catch (e) {
      this.$toast.danger(
        'There was a problem saving this config, please check your config for errors or contact support.'
      )
      this.logErrorForUser(e as Error, 'Auto Onboard template creation', this.baseConfig)
    } finally {
      this.savingConfig = false
    }
  }

  async refetch(shortcode?: string): Promise<void> {
    await this.refetchTemplateList(this.activeProvider, this.activeOwner)
    if (shortcode) {
      await this.fetchSingleTemplate({
        provider: this.activeProvider,
        login: this.activeOwner,
        shortcode,
        refetch: true
      })
    }
  }

  getConfig(shortcode: string): RepoConfigAnalyzerMeta {
    if (this.configTemplate) {
      const config = JSON.parse(this.configTemplate.config) as RepoConfigInterface
      const filteredList = config.analyzers.filter((analyzer) => analyzer.name === shortcode)
      return filteredList.length ? filteredList[0] : ({} as RepoConfigAnalyzerMeta)
    }
    return {} as RepoConfigAnalyzerMeta
  }

  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
