<template>
  <portal to="modal">
    <z-dialog-generic v-if="showModal" @onClose="closeModal">
      <template v-slot:default="{ close }" @click.stop>
        <div @click.stop>
          <z-tabs :defaultActive="currentTab" class="-mb-px w-full sm:w-120 max-w-xl">
            <div class="flex justify-between border-ink-200 border-b px-4">
              <z-tab-list class="pt-4">
                <z-tab-item
                  class="flex items-center space-x-1"
                  :class="autoOnboardAvailable ? 'cursor-pointer' : 'cursor'"
                  :borderActiveColor="autoOnboardAvailable ? 'juniper' : 'transparent'"
                >
                  <span>Activate a repository</span>
                </z-tab-item>
                <z-tab-item v-if="autoOnboardAvailable" class="flex items-center space-x-1">
                  <span>Use Auto Onboard</span>
                </z-tab-item>
              </z-tab-list>
              <z-button
                icon="x"
                buttonType="secondary"
                size="x-small"
                class="self-center"
                @click="close"
              ></z-button>
            </div>
            <z-tab-panes class="h-102">
              <activate-single-repo />
              <auto-onboard-repos @close="close" />
            </z-tab-panes>
          </z-tabs>
        </div>
      </template>
    </z-dialog-generic>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import {
  ZButton,
  ZIcon,
  ZDialogGeneric,
  ZTabs,
  ZTabList,
  ZTabPane,
  ZTabPanes,
  ZTabItem
} from '@deepsourcelabs/zeal'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    ZDialogGeneric
  }
})
export default class AddNewRepo extends mixins(AutoOnboardMixin, ActiveUserMixin) {
  @Prop({ default: false })
  showModal: boolean

  @Prop({ default: 0 })
  currentTab: number

  get autoOnboardAvailable() {
    return (
      ['gh', 'ghe'].includes(this.activeProvider) &&
      this.activeDashboardContext.type === 'team' &&
      this.$gateKeeper.team(TeamPerms.AUTO_ONBOARD_REPOSITORIES, this.teamPerms.permission)
    )
  }

  @Watch('$route.path')
  closeModal(): void {
    this.selectTemplateToOnboard(undefined)
    this.$emit('close')
  }
}
</script>
