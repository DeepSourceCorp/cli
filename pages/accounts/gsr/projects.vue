<template>
  <hero-card height-class="h-102">
    <h1 class="text-2xl font-bold leading-snug text-center text-vanilla-100">Choose a project</h1>
    <p class="mt-3 text-base text-center text-vanilla-400">
      Select the project you wish to setup DeepSource on
    </p>
    <div
      class="flex flex-col items-center my-5 space-y-4"
      :class="{
        'h-72': viewer.gsrProjects && viewer.gsrProjects.length > MAX_PROJECTS_ON_SCREEN
      }"
    >
      <template v-if="$fetchState.pending">
        <div class="w-full h-10 rounded-md bg-ink-300 animate-pulse"></div>
        <div
          v-for="ii in 3"
          :key="ii"
          class="w-full rounded-md h-13 bg-ink-300 animate-pulse"
        ></div>
      </template>
      <template v-else>
        <z-input
          v-if="viewer.gsrProjects && viewer.gsrProjects.length > MAX_PROJECTS_ON_SCREEN"
          v-model="searchCandidate"
          class="rounded-md"
          placeholder="Search for a project"
        ></z-input>
        <template v-if="projectsInSearch.length > 0">
          <button
            v-for="project in projectsInSearch"
            :key="project.login"
            @click="selectAccount(project)"
            :disabled="loading"
            class="flex items-center w-full px-3 py-2 mt-2 space-x-2 rounded-md text-vanilla-100 group bg-ink-100"
          >
            <div class="flex-grow overflow-hidden text-left overflow-ellipsis">
              <div>{{ project.name || project.login }}</div>
              <p v-if="project.name" class="text-xs text-vanilla-400">
                {{ project.login }}
              </p>
            </div>
            <template v-if="project.hasInstalled">
              <z-icon
                v-if="project.isSetupPending"
                icon="alert-circle"
                size="medium"
                v-tooltip="`Project setup pending`"
                color="honey"
              ></z-icon>
              <z-icon v-else icon="check-circle" size="medium" color="juniper"></z-icon>
            </template>
            <z-icon
              v-else-if="loadingAccount === project.login"
              icon="spin-loader"
              size="medium"
              color="juniper"
              class="animate-spin"
            ></z-icon>
            <z-icon
              v-else
              icon="chevron-right"
              size="medium"
              class="flex-shrink-0 duration-100 ease-linear transform group-hover:translate-x-1"
            ></z-icon>
          </button>
        </template>
        <empty-state v-else>
          <template #subtitle>
            No projects matching <b class="text-vanilla-100">{{ searchCandidate }}</b> found
          </template>
        </empty-state>
      </template>
    </div>
    <p class="mt-4 text-sm text-center text-vanilla-400">
      Need help? Write to us at <br />
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="cursor-pointer text-juniper hover:underline"
        >{{ $config.supportEmail }}</a
      >.
    </p>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon, ZInput } from '@deepsource/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

import GSRInstallation from '@/apollo/mutations/installation/gsrInstallationLanding.gql'
import AuthMixin from '~/mixins/authMixin'
import { GsrProject } from '~/types/types'
import { Context } from '@nuxt/types'

@Component({
  components: {
    ZButton,
    ZAvatar,
    ZIcon,
    ZInput
  },
  middleware: [
    function ({ $config, error }: Context): void {
      if (!$config.gsrEnabled) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    }
  ],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class GSRProjectSelector extends mixins(ContextMixin, ActiveUserMixin, AuthMixin) {
  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchActiveUser(),
      this.fetchAuthUrls(),
      this.fetchActiveUserGSRProjects()
    ])
  }

  searchCandidate = ''
  loading = false
  loadingAccount = ''
  MAX_PROJECTS_ON_SCREEN = 3

  get projectsInSearch(): GsrProject[] {
    const projectsList = this.viewer.gsrProjects as GsrProject[]
    if (!this.searchCandidate) {
      return projectsList.slice(0, this.MAX_PROJECTS_ON_SCREEN)
    }

    return projectsList
      .filter(
        (project) =>
          project.login?.toLowerCase().includes(this.searchCandidate) ||
          project.login?.toLowerCase().includes(this.searchCandidate)
      )
      .slice(0, this.MAX_PROJECTS_ON_SCREEN)
  }

  async selectAccount({
    login,
    hasInstalled
  }: {
    login: string
    hasInstalled: boolean
  }): Promise<void> {
    if (hasInstalled) {
      this.$router.push(['', 'gsr', login].join('/'))
      return
    }
    this.loading = true
    this.loadingAccount = login
    const nextUrl = ['', 'accounts', 'gsr', login, 'verify'].join('/')
    try {
      const response = await this.$applyGraphqlMutation(GSRInstallation, { input: { login } })
      const { ok, reauth } = response.data.gsrInstallationLanding
      if (reauth && this.authUrls.gsr) {
        const expiry = new Date().getTime() + 5 * 60 * 1000 // 5 min life

        this.$nuxt.$cookies.set('bifrost-post-auth-redirect', nextUrl, {
          expires: new Date(expiry)
        })

        window.location.href = this.authUrls.gsr
        return
      }
      if (!ok) {
        throw Error
      }
      this.$router.push(nextUrl)
    } catch (e) {
      this.$toast.danger('Something went wrong while connecting your account')
    } finally {
      this.loading = false
      this.loadingAccount = ''
    }
  }
}
</script>
