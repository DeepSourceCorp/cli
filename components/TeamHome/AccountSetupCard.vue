<template>
  <div class="col-span-1 rounded-md border border-slate-400 xl:col-span-2">
    <div v-if="completion > 0" class="p-2">Account setup is {{ completion }}% complete</div>
    <div v-else class="p-2">Setup your account</div>
    <div class="h-1 w-full bg-ink-200">
      <div
        class="h-1 transform bg-juniper transition-all duration-100 ease-in-out"
        :style="{
          width: `${completion}%`
        }"
      ></div>
    </div>
    <div class="space-y-6 p-4">
      <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-2">
        <div
          class="grid h-4 w-4 flex-shrink-0 place-content-center rounded-full"
          :class="getStatus(step) ? 'stroke-4 bg-juniper' : 'border-2 border-slate-400'"
          :style="{
            'stroke-width': 4
          }"
        >
          <z-icon v-if="getStatus(step)" icon="check" color="vanilla-100" size="x-small" />
        </div>
        <div class="space-y-2">
          <h5
            class="leading-none"
            :class="{
              'text-vanilla-400 line-through': getStatus(step),
              'text-vanilla-200': !getStatus(step)
            }"
          >
            {{ step.display_name }}
          </h5>
          <template v-if="!getStatus(step)">
            <p v-if="step.description" class="text-sm text-vanilla-400">{{ step.description }}</p>
            <invite-members-modal v-if="step.shortcode === 'invite-team'" @inviteSuccess="refetch">
              <template #trigger="{ open }">
                <z-button :icon="step.icon" button-type="secondary" size="small" @click="open">{{
                  step.actionLabel
                }}</z-button>
              </template>
            </invite-members-modal>

            <z-button
              v-else
              size="small"
              button-type="secondary"
              :icon="step.icon"
              v-on="step.actions"
            >
              {{ step.actionLabel }}
            </z-button>
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
  actions?: Record<string, () => void>
  actionLabel?: string
  icon?: string
  isSupported: boolean
}

@Component({
  components: {
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

  get steps(): Array<SetupStep> | undefined {
    const setupOptions: Record<string, Partial<SetupStep>> = {
      'activate-repository': {
        actions: {
          click: () => {
            this.showAddRepoModal = true
          }
        },
        actionLabel: 'Activate repo',
        icon: 'plus',
        isSupported: true
      },
      'install-autofix': {
        actions: {
          click: () => {
            this.showInstallAutofixModal = true
          }
        },
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
        actions: {
          click: () => {
            this.showAddRepoModal = true
          }
        },
        actionLabel: 'Setup Transformers',
        icon: 'plus',
        isSupported: this.$gateKeeper.provider(AppFeatures.TRANSFORMS, this.provider)
      }
    }

    return (this.owner.accountSetupStatus as Array<SetupStep>)
      .filter((step) => {
        const { isSupported } = setupOptions[step.shortcode]

        if (isSupported) {
          return step
        }
      })
      .map((step) => {
        return Object.assign(JSON.parse(JSON.stringify(step)), setupOptions[step.shortcode])
      })
  }

  getStatus(step: SetupStep): boolean {
    return step.completed
  }
}
</script>
