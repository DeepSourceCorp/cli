<template>
  <div class="col-span-1 border rounded-md border-slate-400 xl:col-span-2">
    <div v-if="completion > 0" class="p-2">Account setup is {{ completion }}% complete</div>
    <div v-else class="p-2">Setup your account</div>
    <div class="w-full h-1 bg-ink-200">
      <div
        class="h-1 transition-all duration-100 ease-in-out transform bg-juniper"
        :style="{
          width: `${completion}%`
        }"
      ></div>
    </div>
    <div class="p-4 space-y-6">
      <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-2">
        <div
          class="grid flex-shrink-0 w-4 h-4 rounded-full place-content-center"
          :class="getStatus(step) ? 'bg-juniper stroke-4' : 'border-2 border-slate-400'"
          :style="{
            'stroke-width': 4
          }"
        >
          <z-icon icon="check" color="vanilla-100" size="x-small" v-if="getStatus(step)"></z-icon>
        </div>
        <div class="space-y-2">
          <h5
            class="leading-none"
            :class="{
              'line-through text-vanilla-400': getStatus(step),
              'text-vanilla-200': !getStatus(step)
            }"
          >
            {{ step.display_name }}
          </h5>
          <template v-if="!getStatus(step)">
            <p v-if="step.description" class="text-sm text-vanilla-400">{{ step.description }}</p>
            <invite-members-modal v-if="step.shortcode === 'invite-team'" @inviteSuccess="refetch">
              <template v-slot:trigger="{ open }">
                <z-button :icon="step.icon" button-type="secondary" size="small" @click="open">{{
                  step.actionLabel
                }}</z-button>
              </template>
            </invite-members-modal>

            <z-button
              v-else
              @click="step.action"
              size="small"
              button-type="secondary"
              :icon="step.icon"
              >{{ step.actionLabel }}</z-button
            >
          </template>
        </div>
      </div>
    </div>
    <add-repo-modal
      :show-modal="showAddRepoModal"
      @close="
        () => {
          showAddRepoModal = false
          refetch()
        }
      "
    />
    <install-autofix-modal
      v-if="showInstallAutofixModal"
      @close="
        () => {
          showInstallAutofixModal = false
          refetch()
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsource/zeal'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { AddRepoModal } from '@/components/AddRepo'
import InstallAutofixModal from '@/components/Autofix/Modals/InstallAutofixModal.vue'
import { InviteMembersModal } from '@/components/Members'
import { AppFeatures } from '~/types/permTypes'

interface SetupStep {
  completed: boolean
  shortcode: string
  display_name: string
  description: string
  action?: () => void
  actionLabel?: string
  icon?: string
  isSupported: boolean
}

@Component({
  components: {
    ZButton,
    ZIcon,
    ZModal,
    AddRepoModal,
    InviteMembersModal,
    InstallAutofixModal
  }
})
export default class AccountSetupCard extends mixins(OwnerDetailMixin) {
  @Prop()
  completion!: number

  @Prop({ required: true })
  provider: string

  setupOptions: Record<string, Partial<SetupStep>> = {}

  created() {
    this.setupOptions = {
      'activate-repository': {
        action: this.activateRepo,
        actionLabel: 'Activate repo',
        icon: 'plus',
        isSupported: true
      },
      'install-autofix': {
        action: this.installAutofix,
        actionLabel: 'Install Autofix',
        icon: 'autofix',
        isSupported: this.$gateKeeper.provider(AppFeatures.AUTOFIX, this.provider)
      },
      'invite-team': {
        actionLabel: 'Invite team',
        icon: 'user-plus',
        isSupported: true
      },
      'configure-transformers': {
        action: this.activateRepo,
        actionLabel: 'Setup Transformers',
        icon: 'plus',
        isSupported: this.$gateKeeper.provider(AppFeatures.TRANSFORMS, this.provider)
      }
    }
  }

  async fetch(): Promise<void> {
    await this.fetchAccountSetupStatus({
      login: this.$route.params.owner,
      provider: this.provider
    })
  }

  async refetch(): Promise<void> {
    await this.fetchAccountSetupStatus({
      login: this.$route.params.owner,
      provider: this.provider,
      refetch: true
    })
  }

  showAddRepoModal = false
  showInstallAutofixModal = false

  activateRepo() {
    this.showAddRepoModal = true
  }

  installAutofix() {
    this.showInstallAutofixModal = true
  }

  get steps(): Array<SetupStep> | undefined {
    return (this.owner.accountSetupStatus as Array<SetupStep>)
      .filter((step) => {
        const { isSupported } = this.setupOptions[step.shortcode]

        if (isSupported) {
          return step
        }
      })
      .map((step) => {
        return Object.assign(JSON.parse(JSON.stringify(step)), this.setupOptions[step.shortcode])
      })
  }

  getStatus(step: SetupStep): boolean {
    return step.completed
  }
}
</script>
