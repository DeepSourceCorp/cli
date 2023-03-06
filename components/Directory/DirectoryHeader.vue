<template>
  <div>
    <div
      class="fixed z-10 flex items-center w-full px-4 py-4 border-b border-slate-400 top-10 lg:top-0 bg-ink-400"
    >
      <z-breadcrumb separator="/" class="py-px text-sm text-vanilla-100">
        <z-breadcrumb-item
          ><nuxt-link to="/directory" class="text-vanilla-400"
            >All {{ isAnalyzer ? 'analyzers' : 'transformers' }}</nuxt-link
          ></z-breadcrumb-item
        >
        <z-breadcrumb-item is-current
          ><nuxt-link
            :to="
              shortcode
                ? `/directory/${isAnalyzer ? 'analyzers' : 'transformers'}/${shortcode}`
                : '#'
            "
            >{{ infoObj.name }}</nuxt-link
          ></z-breadcrumb-item
        >
      </z-breadcrumb>
    </div>
    <div ref="analyzer-dir-header" class="px-4 border-b py-7 border-slate-400 mt-14">
      <div class="flex items-center space-x-5">
        <div
          class="flex flex-shrink-0 p-4 rounded-md h-26 w-26 place-items-center bg-ink-300"
          :class="{ 'animate-pulse': isLoading }"
        >
          <img
            v-if="infoObj.analyzerLogo || infoObj.logo"
            :src="isAnalyzer ? infoObj.analyzerLogo : infoObj.logo"
            :alt="infoObj.name"
            class="w-20 h-auto"
          />
          <img v-else src="~/assets/images/analyzer-dir/placeholder.svg" class="opacity-40" />
        </div>
        <div>
          <component
            :is="headingLevel"
            v-if="infoObj.name"
            class="text-2xl font-medium leading-tight"
          >
            {{ infoObj.name }}
          </component>
          <div v-else class="w-40 h-8 bg-ink-300 animate-pulse"></div>
          <p v-if="infoObj.owner" class="pl-px text-sm text-vanilla-400">By {{ infoObj.owner }}</p>
          <div v-else class="w-24 h-4 mt-2 bg-ink-300 animate-pulse"></div>
          <div class="flex flex-wrap gap-2 mt-4 lg:flex-nowrap">
            <z-button
              v-if="loggedIn"
              icon="play"
              :label="`Use ${isAnalyzer ? 'Analyzer' : 'Transformer'}`"
              size="small"
              :disabled="isLoading"
              @click="openActionModal"
            />
            <nuxt-link
              v-else
              :to="{ path: '/login', query: { next: `${$route.path}?use-action=true` } }"
              class="inline-flex items-center justify-center h-8 p-0 px-4 py-1 space-x-1 text-xs font-medium leading-loose transition-colors duration-300 ease-in-out rounded-sm focus:outline-none whitespace-nowrap text-ink-400 bg-juniper hover:bg-juniper-600"
            >
              <z-icon icon="play" color="current" size="small" class="mr-1.5" />
              Use {{ isAnalyzer ? 'Analyzer' : 'Transformer' }}
            </nuxt-link>
            <div class="flex gap-2">
              <z-button
                v-if="infoObj.documentationUrl"
                as="link"
                icon="doc"
                label="Docs"
                size="small"
                target="_blank"
                rel="noreferrer noopener"
                button-type="secondary"
                :disabled="isLoading"
                :to="infoObj.documentationUrl"
                class="hidden md:inline-flex"
              />
              <z-menu @menu-toggle="menuToggle">
                <template v-slot:trigger="{ toggle }">
                  <z-button
                    icon="more-vertical"
                    size="small"
                    button-type="secondary"
                    class="md:hidden"
                    :disabled="isLoading"
                    @click="toggle"
                  />
                </template>
                <template v-slot:body="{ close }">
                  <z-menu-item
                    v-if="infoObj.documentationUrl"
                    as="a"
                    :href="infoObj.documentationUrl"
                    icon="doc"
                    target="_blank"
                    rel="noreferrer noopener"
                    :disabled="isLoading"
                    class="flex items-center w-full py-3"
                  >
                    <span>Docs</span>
                  </z-menu-item>
                  <z-menu-item
                    v-if="infoObj.discussUrl"
                    as="a"
                    :href="infoObj.discussUrl"
                    icon="message-square"
                    target="_blank"
                    rel="noreferrer noopener"
                    :disabled="isLoading"
                    class="flex items-center w-full py-3"
                  >
                    <span>Discuss</span>
                  </z-menu-item>
                  <z-menu-item
                    as="button"
                    button-type="ghost"
                    color="vanilla-300"
                    icon="feather"
                    :disabled="isLoading"
                    class="flex items-center w-full py-3 mb-3"
                    @click="
                      () => {
                        showAnalyzerFeedbackModal = true
                        close()
                      }
                    "
                  >
                    Send feedback
                  </z-menu-item>
                </template>
              </z-menu>
            </div>
          </div>
        </div>
        <div class="hidden md:block md:flex-grow"></div>
        <div class="hidden md:flex md:gap-2 place-content-end place-items-end place-self-end">
          <z-button
            v-if="infoObj.discussUrl"
            as="link"
            icon="message-square"
            label="Discuss"
            size="small"
            button-type="secondary"
            target="_blank"
            rel="noreferrer noopener"
            :disabled="isLoading"
            :to="infoObj.discussUrl"
          />
          <z-button
            icon="feather"
            label="Send feedback"
            size="small"
            button-type="secondary"
            :disabled="isLoading"
            class="ml-1"
            @click="
              () => {
                if (!isLoading) showAnalyzerFeedbackModal = true
              }
            "
          />
        </div>
      </div>
    </div>
    <portal to="modal">
      <lazy-directory-feedback-modal
        v-if="showAnalyzerFeedbackModal"
        :shortcode="shortcode"
        :is-analyzer="isAnalyzer"
        @close="showAnalyzerFeedbackModal = false"
      />
    </portal>
    <lazy-add-repo-modal
      v-if="showAddRepoModal"
      :show-modal="showAddRepoModal"
      :show-auto-onboard="false"
      :analyzer-shortcode="isAnalyzer ? shortcode : analyzerShortcode"
      :transformer-shortcode="isAnalyzer ? '' : shortcode"
      @close="showAddRepoModal = false"
    />
    <lazy-install-autofix-modal v-if="showInstallAutofixModal" @close="closeAutofixModal" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, mixins } from 'nuxt-property-decorator'

import { ZButton, ZBreadcrumb, ZBreadcrumbItem, ZMenu, ZMenuItem, ZIcon } from '@deepsource/zeal'

import { Analyzer, TransformerTool } from '~/types/types'
import AuthMixin from '~/mixins/authMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: { ZButton, ZBreadcrumb, ZBreadcrumbItem, ZMenu, ZMenuItem, ZIcon },
  name: 'DirectoryHeader'
})
export default class DirectoryHeader extends mixins(AuthMixin, OwnerDetailMixin, ActiveUserMixin) {
  @Prop()
  infoObj!: Analyzer | TransformerTool

  @Prop({ default: false })
  isLoading: boolean

  @Prop({ default: 'h1' })
  headingLevel: string

  @Prop({ default: 'analyzer' })
  type!: string

  private showAnalyzerFeedbackModal = false
  private showAddRepoModal = false
  private showInstallAutofixModal = false

  async fetch(): Promise<void> {
    if (!this.isAnalyzer && this.loggedIn)
      await this.fetchOwnerDetails({ login: this.activeOwner, provider: this.activeProvider })
  }

  mounted() {
    //? The following two lines ensure that background image is lazily loaded for the header
    const header = this.$refs['analyzer-dir-header'] as HTMLElement
    if (header) header.classList.add('directory-banner')
    const activateUseModal = (this.$route.query['use-action'] as string) || ''
    if (typeof activateUseModal === 'string' && activateUseModal === 'true' && this.loggedIn) {
      if (this.isAnalyzer || (this.owner && this.owner.isAutofixEnabled))
        this.showAddRepoModal = true
      else if (this.owner && !this.owner.isAutofixEnabled) this.showInstallAutofixModal = true
    }
  }

  get isAnalyzer(): boolean {
    return this.type === 'analyzer'
  }

  get shortcode(): string {
    if (this.isAnalyzer) return this.infoObj.shortcode || this.$route.params.analyzer
    return this.infoObj.shortcode || this.$route.params.transformer
  }

  get analyzerShortcode(): string {
    const transformerObj = this.infoObj as TransformerTool
    if (transformerObj && transformerObj.analyzer) return transformerObj.analyzer.shortcode
    return ''
  }

  menuToggle(state: boolean): void {
    this.$emit('menu-toggle', state)
  }

  openActionModal(): void {
    if (this.isAnalyzer || (this.owner && this.owner.isAutofixEnabled)) this.showAddRepoModal = true
    else if (this.owner && !this.owner.isAutofixEnabled) this.showInstallAutofixModal = true
  }

  async closeAutofixModal(): Promise<void> {
    await this.fetchOwnerDetails({
      login: this.activeOwner,
      provider: this.activeProvider,
      refetch: true
    })
    this.showInstallAutofixModal = false
  }
}
</script>
<style scoped>
.directory-banner {
  background-image: url('~assets/images/analyzer-dir/directory_banner.svg');
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
