<template>
  <stat-section :bodyIsGrid="false" :bodySpacing="0">
    <div class="p-4 space-y-4 border-b border-ink-200">
      <div class="flex space-x-4">
        <z-avatar
          :image="viewer.avatar"
          :fallback-image="getDefaultAvatar(viewer.email)"
          :user-name="viewer.fullName"
          size="lg"
        ></z-avatar>
        <div>
          <h3 class="text-base font-medium text-vanilla-100">{{ viewer.fullName }}</h3>
          <p class="text-xs text-vanilla-400">{{ viewer.email }}</p>
        </div>
      </div>
      <div
        v-if="viewer && viewer.dashboardContext && viewer.dashboardContext.length"
        class="space-y-2"
      >
        <h6 class="text-xs font-medium tracking-wide uppercase text-vanilla-400">Your Teams</h6>
        <div class="space-x-2">
          <nuxt-link
            v-for="ctx in viewer.dashboardContext"
            :to="['', ctx.vcs_provider, ctx.login].join('/')"
            :key="ctx.id"
          >
            <z-avatar
              v-tooltip="`${ctx.team_name || ctx.login} - ${ctx.vcs_provider_display}`"
              :key="ctx.login"
              :image="ctx.avatar_url"
              :fallback-image="getDefaultAvatar(ctx.login, ctx.type === 'user')"
              :user-name="ctx.login"
            />
          </nuxt-link>
        </div>
      </div>
    </div>
    <div>
      <div class="p-2 px-4">Recommended actions</div>
      <div class="w-full h-px bg-ink-200">
        <div
          class="h-0.5 bg-juniper transform transition-all duration-100 ease-in-out"
          :style="{
            width: `${completion}%`
          }"
        ></div>
      </div>
      <div class="p-4 space-y-6">
        <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-2">
          <z-checkbox
            class="mt-2"
            :modelValue="step.isComplete"
            @change="(val) => updateCheck(step.name, val)"
          ></z-checkbox>
          <div class="space-y-2">
            <h5
              class="leading-none"
              :class="{
                'line-through text-vanilla-400': step.isComplete,
                'text-vanilla-200': !step.isComplete
              }"
            >
              {{ step.title }}
            </h5>
            <template v-if="!step.isComplete">
              <p v-if="step.description" class="text-sm text-vanilla-400">{{ step.description }}</p>
              <z-button @click="triggerStep(step)" size="small" buttonType="secondary">{{
                step.actionLabel
              }}</z-button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <add-repo-modal :showModal="showAddRepoModal" @close="showAddRepoModal = false" />
  </stat-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZAvatar, ZCheckbox, ZButton } from '@deepsource/zeal'
import { AddRepoModal } from '@/components/AddRepo'
import ActiveUserMixin from '@/mixins/activeUserMixin'
import { getDefaultAvatar } from '~/utils/ui'
import { StatSection } from '@/components/Metrics'

export interface Step {
  name: string
  title: string
  isComplete: boolean
  actionIcon: string
  actionLabel: string
  description?: string
  action?: () => void
  actionUrl?: string
}

@Component({
  components: {
    StatSection,
    ZAvatar,
    ZCheckbox,
    ZButton,
    AddRepoModal
  },
  methods: { getDefaultAvatar }
})
export default class ViewerCard extends mixins(ActiveUserMixin) {
  showAddRepoModal = false
  computingFlag = 0

  /**
   * Method to show the activate repo modal
   *
   * @returns {void}
   */
  showActivateRepoModal(): void {
    this.showAddRepoModal = true
  }

  /**
   * Trigger action for a given step
   *
   * @param {Step} step
   * @returns {void}
   */
  triggerStep(step: Step): void {
    if (step.action) {
      step.action()
    } else if (step.actionUrl) {
      if (step.actionUrl.startsWith('http')) {
        window.open(step.actionUrl, '_blank')
      } else {
        this.$router.push(step.actionUrl)
      }
    }

    this.updateCheck(step.name, true)
  }

  /**
   * Update check
   *
   * @param {string} key
   * @param {boolean} val
   *
   * @returns {void}
   */
  updateCheck(key: string, val: boolean): void {
    this.computingFlag++
    this.$localStore.set(this.storeKey, key, val)
  }

  get storeKey(): string {
    return `${this.viewer.id}-onboarding-steps`
  }

  /**
   * Action to copy referral url
   *
   * @returns {void}
   */
  copyReferralUrl(): void {
    if (this.viewer.referralUrl) {
      this.$copyToClipboard(this.viewer.referralUrl)
      this.$toast.success('Copied referral URL to clipboard')
    }
  }

  get steps(): Array<Step> {
    // Don't remove this, this is to hack vue reactivity and force recompute of steps
    this.computingFlag
    return [
      {
        name: 'activate-repo',
        title: 'Activate analysis on a repository',
        description: 'Activate a repository to start automated analysis and quality checks.',
        isComplete: this.$localStore.get(this.storeKey, 'activate-repo') as boolean,
        action: this.showActivateRepoModal,
        actionLabel: 'Activate a repo',
        actionIcon: 'plus'
      },
      {
        name: 'add-new-account',
        title: 'Add a new account',
        isComplete: this.$localStore.get(this.storeKey, 'add-new-account') as boolean,
        description:
          'Have a project that needs analysing? You can add multiple accounts and gain deeper insights about your code.',
        actionUrl: '/installation/providers',
        actionLabel: 'Add new account',
        actionIcon: 'plus'
      },
      {
        name: 'join-discuss',
        title: 'Join DeepSource Discuss',
        description:
          'Get in touch with our engineering team, get your questions answered, give feedback.',
        isComplete: this.$localStore.get(this.storeKey, 'join-discuss') as boolean,
        actionUrl: 'https://discuss.deepsource.io/',
        actionLabel: 'Join DeepSource Discuss',
        actionIcon: 'message-square'
      },
      {
        name: 'follow-twitter',
        title: 'Follow us on Twitter',
        description: 'Follow us to get to know about upcoming features and new updates',
        isComplete: this.$localStore.get(this.storeKey, 'follow-twitter') as boolean,
        actionUrl: 'https://twitter.com/intent/user?screen_name=DeepSourceHQ',
        actionLabel: 'Follow @DeepSourceHQ',
        actionIcon: 'twitter'
      }
    ]
  }

  get completion(): number {
    const completed = this.steps.reduce((total, step) => (step.isComplete ? total + 1 : total), 0)
    return (completed / this.steps.length) * 100
  }
}
</script>
