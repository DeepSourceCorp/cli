<template>
  <div class="mx-auto min-h-screen w-full lg:max-w-6xl 2xl:max-w-7xl">
    <div
      v-if="publicReport && publicReport.owner"
      class="sticky top-0 left-0 z-30 w-full border-b border-slate-400 bg-ink-400 lg:hidden"
    >
      <z-button
        id="mobile-sidebar-toggle"
        icon="menu"
        button-type="ghost"
        size="large"
        color="vanilla-100"
        @click="triggerSidebarExpand"
      />
    </div>

    <div v-if="publicReport && publicReport.owner" class="flex gap-14">
      <public-report-sidebar
        :reports="publicReport.reportKeys"
        :owner-logo="publicReport.owner.avatar"
        :owner-login="publicReport.owner.login"
        :token="token"
        :report-id="$route.params.reportId"
      />

      <div
        class="w-screen border-t border-slate-400 px-4 pt-6 pb-10 text-sm sm:w-auto md:border-t-0 md:px-6 md:text-base lg:pt-26"
      >
        <nuxt-child
          :share-historical-data="publicReport.shareHistoricalData"
          :level="publicReport.level"
          :owner-login="publicReport.owner.login"
          :created-at="formatDate(parseISODate(publicReport.createdAt))"
          :token="token"
        />

        <section
          id="about"
          class="scroll-mt-8 mt-14 space-y-4 border-b border-slate-400 pb-14 leading-8 text-vanilla-400"
        >
          <h2 class="text-lg font-semibold text-vanilla-100">About DeepSource</h2>
          <p>
            <a
              href="https://deepsource.io"
              rel="nofollow noopener noreferrer"
              target="_blank"
              class="font-medium text-juniper-500"
            >
              DeepSource
            </a>
            is a technology company that builds tools for developers. It provides a set of tools
            that fit into a developer’s workflow. Our cloud-based technology scans code in multiple
            languages and detects flaws in the codebase including, but not restricted to security
            and performance issues, bug risks, and anti-patterns.
          </p>
          <p>DeepSource is based in San Francisco, California and Bengaluru, India.</p>
        </section>

        <footer class="mt-10 flex justify-between">
          <img class="h-4" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource logo" />
          <span class="text-xs text-vanilla-400">© {{ currentYear }} DeepSource Corp.</span>
        </footer>
      </div>
    </div>

    <div
      v-else-if="errorMessage"
      class="flex h-screen animate-glow-bg-brighter items-center justify-center"
    >
      <div class="w-98 px-5">
        <div class="mb-2 flex w-max items-center gap-x-2 bg-ink-300 px-4 py-2.5">
          <z-icon icon="z-lock" />
          <span class="text-xs font-medium">This report is password-protected</span>
        </div>

        <form class="mb-10 rounded-md bg-ink-300 px-6 py-6" @submit="submitPassword">
          <label for="public-report-pasword" class="mb-2 block text-sm font-medium">
            Enter password
          </label>
          <div class="mb-2 space-y-2">
            <div class="relative">
              <z-input
                id="public-report-pasword"
                v-model="password"
                v-focus
                placeholder="Password to access the report"
                :required="true"
                :type="isPasswordHidden ? 'password' : 'text'"
                class="rounded-md border-slate-400"
                @input="clearPasswordError"
              />
              <div class="absolute top-1 right-1 flex gap-x-1 bg-ink-400">
                <z-button
                  v-tooltip="isPasswordHidden ? 'Reveal password' : 'Hide password'"
                  button-type="secondary"
                  :icon="isPasswordHidden ? 'eye' : 'eye-off'"
                  size="small"
                  :disabled="!password"
                  @click="isPasswordHidden = !isPasswordHidden"
                />
              </div>
            </div>
            <p :class="passwordError ? 'visible' : 'invisible'" class="text-xs text-cherry">
              {{ passwordErrorMessage }}
            </p>
          </div>
          <z-button
            label="Open report"
            icon="z-unlock"
            size="small"
            type="submit"
            full-width
            :is-loading="submitPasswordLoading"
            :disabled="submitPasswordLoading"
            @click.prevent="submitPassword"
          />
        </form>

        <img
          class="mx-auto h-5 w-auto"
          src="~/assets/images/logo-wordmark-white.svg"
          alt="DeepSource"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZDivider, ZTag, ZButton, ZInput } from '@deepsource/zeal'
import { Context } from '@nuxt/types'
import gql from 'graphql-tag'

import PublicReportMixin from '~/mixins/publicReportMixin'
import { PublicReport } from '~/types/types'
import { formatDate, parseISODate } from '~/utils/date'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { PublicReportErrors } from '~/types/reportTypes'

/**
 * Public Report parent page
 */
@Component({
  components: {
    ZIcon,
    ZDivider,
    ZTag,
    ZButton,
    ZInput
  },
  methods: {
    formatDate,
    parseISODate
  },
  scrollToTop: true,
  /**
   * The middleware has a twofold purpose:
   * 1. Query the reportKeys of the public report, find the first report in the list
   * and redirect to that report.
   * 2. Check if public report does not exist and show 404 page
   *
   * Rest of the errors are handled in fetchPublicReportBase & verifyPasswordForPublicReport
   * in PublicReportMixin
   */
  middleware: [
    async function ({ $fetchGraphqlData, params, redirect, route, error }: Context): Promise<void> {
      const { reportId } = params
      if (route.name === 'report-reportId') {
        try {
          const response = (await $fetchGraphqlData(
            gql`
              query ($reportId: String!) {
                publicReport(reportId: $reportId) {
                  reportKeys
                }
              }
            `,
            { reportId },
            true,
            false
          )) as GraphqlQueryResponse

          const reports = response.data.publicReport?.reportKeys

          if (Array.isArray(reports) && reports.length) {
            const firstReport = reports[0]
            redirect(`/report/${reportId}/${firstReport}`)
          }
        } catch (e) {
          const message = (e as Error).message.replace('GraphQL error: ', '')

          // show 500 error if the server returns a non standard error
          if (!(Object.values(PublicReportErrors) as string[]).includes(message)) {
            error({ statusCode: 500 })
          }

          if (message === PublicReportErrors.DOES_NOT_EXIST) {
            error({ statusCode: 404, message: 'This page is not real' })
          }
        }
      }
    }
  ]
})
export default class PublicReportPageParent extends mixins(PublicReportMixin) {
  public publicReport: PublicReport = {} as PublicReport

  public isPasswordHidden = true
  public password = ''
  public token = ''
  public passwordError = false
  // If default value is '', vue doesn't render the error HTML element
  public passwordErrorMessage = 'Please enter password to access the report'

  PublicReportErrors = PublicReportErrors

  /**
   * Fetch hook for the component.
   * Fetches basic data of public report and handles redirection to first report
   * for protected reports.
   */
  async mounted() {
    await this.fetchDataAndRedirect()
  }

  async fetchDataAndRedirect() {
    const { reportId } = this.$route.params

    this.publicReport = (await this.fetchPublicReportBase(reportId, this.token)) as PublicReport

    // Redirection specifically for protected reports
    // For non-protected reports, redirection happens in middleware above
    if (this.publicReport?.isRestricted && this.token && this.publicReport?.reportKeys?.length) {
      const firstReport = this.publicReport.reportKeys[0]

      this.$router.push(`/report/${reportId}/${firstReport}`)
    }
  }

  /**
   * Submit report password and set errors.
   */
  async submitPassword() {
    const { reportId } = this.$route.params

    if (!this.password.length) {
      this.passwordError = true
      this.passwordErrorMessage = 'Please enter password to access the report'
      return
    }

    this.token = await this.verifyPasswordForPublicReport({ password: this.password, reportId })

    if (this.errorMessage === PublicReportErrors.INVALID_PASSWORD) {
      this.passwordError = true
      this.passwordErrorMessage = 'Invalid password'
      return
    }

    if (this.token) {
      this.passwordError = false
      this.fetchDataAndRedirect()
    }
  }

  /**
   * Emit show-public-report-sidebar event to trigger sidebar expansion.
   */
  triggerSidebarExpand() {
    this.$root.$emit('ui:show-public-report-sidebar')
  }

  /**
   * Clear password error shown when user starts typing again
   */
  clearPasswordError() {
    if (this.passwordError) {
      this.passwordError = false
    }
  }

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }
}
</script>
