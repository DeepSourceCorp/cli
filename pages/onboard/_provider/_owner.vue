<template>
  <div class="min-h-screen">
    <nav class="sticky top-0 z-50 border-b col-span-full border-ink-200 h-14 bg-ink-400">
      <section class="grid h-full max-w-5xl grid-cols-2 px-4 py-2.5 mx-auto">
        <div class="flex items-center">
          <component
            :is="isAnalysisRunning ? 'div' : 'nuxt-link'"
            :to="isAnalysisRunning ? null : repoSelectorRoute"
            class="flex items-center h-full pr-2 border-r md:pr-5 border-ink-200"
          >
            <img
              src="~/assets/images/logo-wordmark-white.svg"
              class="hidden h-5 md:block"
              alt="DeepSource word mark"
            />
            <img
              src="~/assets/images/logomark.svg"
              class="h-5 md:hidden"
              alt="DeepSource word mark"
            />
          </component>
          <span class="flex items-center pl-5 space-x-2">
            <z-avatar
              :image="activeDashboardContext.avatar_url"
              :user-name="activeDashboardContext.login"
              :fallback-image="
                getDefaultAvatar(
                  activeDashboardContext.login,
                  activeDashboardContext.type === 'user'
                )
              "
              size="sm"
              class="flex-shrink-0 leading-none rounded-full"
            />
            <span class="text-sm font-normal text-vanilla-200">
              {{ activeDashboardContext.team_name || activeDashboardContext.login }}
            </span>
          </span>
        </div>
        <div class="flex justify-end">
          <z-button
            icon="support"
            label="Get help"
            button-type="secondary"
            icon-size="small"
            size="small"
            class="border border-ink-200"
            :to="`mailto:${$config.supportEmail}`"
          />
        </div>
      </section>
    </nav>
    <main class="grid max-w-5xl grid-cols-5 gap-5 px-4 py-5 mx-auto sm:py-12">
      <div class="hidden sm:block">
        <div
          class="sticky top-26"
          :class="
            $route.name !== 'onboard-provider-owner-repo-running' ? 'divide-y  divide-ink-200' : ''
          "
        >
          <client-only>
            <z-stepper align="vertical" :showNumbers="false" class="w-full mb-2">
              <z-step
                v-for="(step, index) in steps"
                :key="step.route"
                :title="`Step ${index + 1}`"
                :status="getStepStatus(step, index)"
              >
                <template #description>
                  <component
                    :is="allowStepLink(step, index) ? 'nuxt-link' : 'span'"
                    :to="allowStepLink(step, index) ? step.link : null"
                    :class="[
                      'font-semibold',
                      allowStepLink(step, index) ? 'hover:text-vanilla-100' : '',
                      getStepStatus(step, index) === 'active'
                        ? 'text-vanilla-100'
                        : 'text-vanilla-400'
                    ]"
                  >
                    {{ step.title }}
                  </component>
                  <div class="h-12 text-xs font-normal text-vanilla-400">
                    <div class="items-center" v-if="step.showRepo && currentRepo">
                      <z-icon
                        v-if="repository && 'isPrivate' in repository"
                        :icon="repository.isPrivate ? 'z-lock' : 'globe'"
                        size="x-small"
                        class="inline-block p-px"
                      />
                      <span>
                        {{ currentRepo }}
                      </span>
                    </div>
                  </div>
                </template>
              </z-step>
            </z-stepper>
          </client-only>
        </div>
      </div>
      <div class="hidden col-span-1 sm:block"></div>
      <nuxt-child class="col-span-full sm:col-span-3" />
    </main>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { ZAvatar, ZIcon, ZButton, ZStepper, ZStep } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { Context } from '@nuxt/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { getDefaultAvatar } from '~/utils/ui'

/**
 * Wrapper for onboarding pages,
 * this has the sidebar with all the actions and the navbar
 */
@Component({
  components: {
    ZAvatar,
    ZIcon,
    ZButton,
    ZStepper,
    ZStep
  },
  middleware: [
    'restrictOnboarding',
    function ({ redirect, route, $config }: Context): void {
      if (route.name === 'onboard-provider-owner') {
        const { provider, owner } = route.params
        redirect(`/onboard/${provider}/${owner}/repositories`)
      }
    }
  ],
  methods: { getDefaultAvatar },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class OnboardLogin extends mixins(
  OwnerDetailMixin,
  ActiveUserMixin,
  RepoDetailMixin
) {
  public repoSyncLoading = false

  get steps(): { title: string; route: string; link: string; showRepo: boolean }[] {
    return [
      {
        title: 'Pick a repository',
        route: 'onboard-provider-owner-repositories',
        link: this.repoSelectorRoute,
        showRepo: true
      },
      {
        title: 'Set preferences',
        route: 'onboard-provider-owner-repo-preferences',
        link: this.preferencesRoute,
        showRepo: false
      },
      {
        title: 'Activate analysis',
        route: 'onboard-provider-owner-repo-config',
        link: this.analysisConfigRoute,
        showRepo: false
      }
    ]
  }

  /**
   * If the running stage is on, don't allow links on steps
   * Else allow only if the step is completed
   * @param {{title:string;route:string}} step
   * @param {number} index
   * @return {boolean}
   */
  allowStepLink(step: { title: string; route: string }, index: number): boolean {
    if (this.isAnalysisRunning) {
      // disable all links when running
      return false
    }

    if (this.getStepStatus(step, index) === 'completed') {
      return true
    }

    return false
  }

  get currentRepo(): string {
    const { owner, repo } = this.$route.params
    return owner && repo ? repo : ''
  }

  get isAnalysisRunning(): boolean {
    return this.$route.name === 'onboard-provider-owner-repo-running'
  }

  get preferencesRoute(): string {
    const { owner, provider, repo } = this.$route.params
    return `/onboard/${provider}/${owner}/${repo}/preferences`
  }

  get analysisConfigRoute(): string {
    const { owner, provider, repo } = this.$route.params
    return `/onboard/${provider}/${owner}/${repo}/config`
  }

  get repoSelectorRoute(): string {
    const { owner, provider } = this.$route.params
    return `/onboard/${provider}/${owner}/repositories`
  }

  /**
   * Get the step status for the stepper UI based on current route
   * @param {{title:string;route:string}} step
   * @param {number} index
   * @return {string}
   */
  getStepStatus(step: { title: string; route: string }, index: number): string {
    if (this.$route.name === 'onboard-provider-owner-repo-running') {
      return 'completed'
    }

    const currentActiveStepIndex = this.steps.findIndex((step) => step.route == this.$route.name)

    if (index === currentActiveStepIndex) {
      return 'active'
    }

    if (index < currentActiveStepIndex) {
      return 'completed'
    }

    return 'default'
  }

  /**
   * Fetch all the requried data
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchActiveUser({ refetch: true }),
      this.fetchOwnerDetails({
        login: this.activeOwner,
        provider: this.activeProvider,
        refetch: true
      })
    ])
  }
}
</script>
