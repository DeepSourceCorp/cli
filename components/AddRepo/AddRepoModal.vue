<template>
  <portal to="modal">
    <z-dialog-generic v-if="showModal" @onClose="closeModal">
      <template #default="{ close }">
        <div class="max-w-xl sm:w-120" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-400 px-4">
            <div class="hide-scroll flex flex-nowrap gap-x-5 overflow-x-auto pt-4">
              <z-tab
                v-for="(item, index) in tabItemList"
                :key="index"
                :border-active-color="tabItemList.length > 1 ? 'juniper' : 'transparent'"
                :is-active="index === activeTabIndex"
                class="flex-shrink-0"
                :class="tabItemList.length > 1 ? 'cursor-pointer' : 'cursor'"
                @click.native="updateActiveIndex(index)"
              >
                <span>{{ item.title }}</span>
              </z-tab>
            </div>
            <z-button
              icon="x"
              button-type="secondary"
              size="x-small"
              class="hidden self-center sm:inline-flex"
              @click="close"
            />
          </div>

          <div class="h-102">
            <component
              :is="activeTabItem.component"
              v-bind="activeTabItem.bindings"
              @close="close"
            />
          </div>
        </div>
      </template>
    </z-dialog-generic>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZDialogGeneric, ZTab } from '@deepsource/zeal'

import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { OwnerFeatureType } from '~/types/ownerTypes'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZTab,
    ZDialogGeneric
  }
})
export default class AddNewRepo extends mixins(AutoOnboardMixin, ActiveUserMixin) {
  @Prop({ default: false })
  showModal: boolean

  @Prop({ default: 0 })
  defaultActiveTab: number

  @Prop({ default: true })
  showAutoOnboard: boolean

  @Prop({ default: true })
  showMonorepo: boolean

  @Prop({ default: '' })
  analyzerShortcode: string

  @Prop({ default: '' })
  transformerShortcode: string

  activeTabIndex = 0
  monorepoFeatureAllowed = false

  created() {
    this.activeTabIndex = this.defaultActiveTab
  }

  get tabItemList() {
    const tabsConfig = [
      {
        title: 'Activate a repository',
        visible: true,
        component: 'ActivateSingleRepo',
        bindings: {
          'analyzer-shortcode': this.analyzerShortcode,
          'transformer-shortcode': this.transformerShortcode
        }
      },
      {
        title: 'Use Auto Onboard',
        visible: this.autoOnboardAvailable && this.showAutoOnboard,
        component: 'AutoOnboardRepos'
      },
      {
        title: 'Monorepos',
        visible: this.showMonorepoSection && this.showMonorepo,
        component: 'ActivateSingleRepo',
        bindings: {
          'analyzer-shortcode': this.analyzerShortcode,
          'list-monorepos-only': true,
          'transformer-shortcode': this.transformerShortcode
        }
      }
    ]

    return tabsConfig.filter((item) => item.visible)
  }

  get activeTabItem() {
    return this.tabItemList[this.activeTabIndex] ?? this.tabItemList[0]
  }

  get autoOnboardAvailable() {
    return (
      this.$gateKeeper.provider(AppFeatures.AUTO_ONBOARD, this.activeProvider) &&
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.AUTO_ONBOARD_REPOSITORIES, this.teamPerms.permission)
    )
  }

  get showMonorepoSection(): boolean {
    return (
      this.monorepoFeatureAllowed &&
      this.$gateKeeper.provider(AppFeatures.MONOREPO, this.activeProvider)
    )
  }

  async fetch() {
    if (this.showMonorepo) {
      //? For some reason, activeUser (and hence activeOwner and activeProvider) was unavailable
      //? when the fetch hook of this component ran. Hence, explicitly fetching it if unavailble.
      if (!this.activeOwner || !this.activeProvider) {
        await this.fetchActiveUserIfLoggedIn()
      }

      try {
        this.monorepoFeatureAllowed = await this.$isFeatureAvailable(OwnerFeatureType.MONOREPO, {
          login: this.activeOwner,
          provider: this.$providerMetaMap[this.activeProvider].value
        })

        if (this.activeTabIndex >= this.tabItemList.length) {
          this.activeTabIndex = 0
        }
      } catch (error) {
        this.$logErrorAndToast(
          error as Error,
          'Unable to fetch details about the team. Please contact support.'
        )
      }
    }
  }

  updateActiveIndex(index: number) {
    if (index < this.tabItemList.length) {
      this.activeTabIndex = index
    }
  }

  // We need to refetch owner features when the active owner/provider changes
  @Watch('activeProvider')
  @Watch('activeOwner')
  refetchDataOnChange(): void {
    this.$fetch()
  }

  @Watch('$route.path')
  closeModal(): void {
    this.selectTemplateToOnboard(undefined)
    this.$emit('close')
  }
}
</script>
