<template>
  <div class="border border-ink-200 rounded-md col-span-1 xl:col-span-2">
    <div v-if="completion > 0" class="p-2">Account is {{ completion }}% setup</div>
    <div v-else class="p-2">Setup your account</div>
    <div class="w-full h-1 bg-ink-200">
      <div
        class="h-1 bg-juniper transform transition-all duration-100 ease-in-out"
        :style="{
          width: `${completion}%`
        }"
      ></div>
    </div>
    <div class="p-4 space-y-6">
      <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-2">
        <div
          class="h-4 w-4 rounded-full flex-shrink-0 grid place-content-center"
          :class="getStatus(step) ? 'bg-juniper stroke-4' : 'border-2 border-ink-50'"
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
            <z-button @click="step.action" size="small" buttonType="secondary" :icon="step.icon">{{
              step.actionLabel
            }}</z-button>
          </template>
        </div>
      </div>
    </div>
    <add-repo-modal
      :showModal="showAddRepoModal"
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
    <portal to="modal">
      <invite-members-modal
        :showModal="showInviteMembersModal"
        @close="
          () => {
            showInviteMembersModal = false
            refetch()
          }
        "
        @inviteSuccess="inviteSuccess"
      ></invite-members-modal>
      <z-modal
        v-if="showInviteSuccessModal"
        @onClose="showInviteSuccessModal = false"
        @primaryAction="showInviteSuccessModal = false"
        title="Invitation Sent"
      >
        <div class="p-4 space-y-4 border-b border-ink-200">
          <div class="text-5xl text-center">📫</div>
          <p class="text-xs text-vanilla-400 max-w-sm mx-auto text-center">
            We've sent an email to your team members, they can create an account using the URL in
            that email and join your team
          </p>
        </div>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { AddRepoModal } from '@/components/AddRepo'
import InstallAutofixModal from '@/components/Autofix/Modals/InstallAutofixModal.vue'

interface SetupStep {
  completed: boolean
  shortcode: string
  display_name: string
  description: string
  action?: () => void
  actionLabel?: string
}

@Component({
  components: {
    ZButton,
    ZIcon,
    ZModal,
    AddRepoModal,
    InstallAutofixModal
  }
})
export default class AccountSetupCard extends mixins(OwnerDetailMixin) {
  @Prop()
  completion!: number

  async fetch(): Promise<void> {
    await this.fetchAccountSetupStatus({
      login: this.$route.params.owner,
      provider: this.$route.params.provider
    })
  }

  async refetch(): Promise<void> {
    await this.fetchAccountSetupStatus({
      login: this.$route.params.owner,
      provider: this.$route.params.provider,
      refetch: true
    })
  }

  showAddRepoModal = false
  showInstallAutofixModal = false
  showInviteMembersModal = false
  showInviteSuccessModal = false

  activateRepo() {
    this.showAddRepoModal = true
  }

  installAutofix() {
    this.showInstallAutofixModal = true
  }

  inviteMembers() {
    this.showInviteMembersModal = true
  }

  inviteSuccess() {
    this.refetch()
    this.showInviteSuccessModal = true
  }

  setupOptions: Record<string, unknown> = {
    'activate-repository': {
      action: this.activateRepo,
      actionLabel: 'Activate repo',
      icon: 'plus'
    },
    'install-autofix': {
      action: this.installAutofix,
      actionLabel: 'Install Autofix',
      icon: 'autofix'
    },
    'invite-team': {
      action: this.inviteMembers,
      actionLabel: 'Invite team',
      icon: 'user-plus'
    },
    'configure-transformers': {
      action: this.activateRepo,
      actionLabel: 'Setup Transformers',
      icon: 'plus'
    }
  }

  get steps(): Array<SetupStep> {
    return (this.owner.accountSetupStatus as Array<SetupStep>).map((step) => {
      return Object.assign(step, this.setupOptions[step.shortcode]) as SetupStep
    })
  }

  get activeIndex(): number {
    return this.steps.findIndex((step) => step.completed) + 1
  }

  getStatus(step: SetupStep): boolean {
    return step.completed
  }
}
</script>
