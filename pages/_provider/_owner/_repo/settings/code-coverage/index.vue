<template>
  <div class="max-w-2xl space-y-5 p-4">
    <page-title
      class="max-w-2xl"
      title="Code Coverage"
      description-width-class="max-w-2xl"
      description="Manage how you track the code coverage of this repository."
    />

    <main class="space-y-7">
      <div class="space-y-5">
        <z-alert type="info" class="border border-robin border-opacity-10 bg-opacity-5 pt-2 pb-3">
          <div class="space-y-2 text-xs font-medium text-robin-400">
            <p class="text-sm leading-8">How does it work?</p>
            <p class="font-normal leading-6 text-robin-150">
              Code Coverage is automatically enabled when we receive a coverage report for your
              repository. Send a coverage report to DeepSource directly using the CLI or integrate
              coverage reporting in your CI pipeline.
            </p>
            <p>
              <a
                href="https://deepsource.io/docs/analyzer/test-coverage#setup-test-coverage"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-x-0.5 hover:underline focus:underline"
              >
                Learn more
                <z-icon icon="arrow-up-right" color="robin-400" size="x-small" />
              </a>
            </p>
          </div>
        </z-alert>

        <coverage-enabled-card
          :has-test-coverage="hasTestCoverage"
          :dsn="dsn"
          :loading="$fetchState.pending"
        />
      </div>

      <div class="space-y-3">
        <h3 class="text-sm leading-5">Preferences</h3>

        <div
          v-if="$fetchState.pending"
          class="h-infer-toggle animate-pulse rounded-md bg-ink-300"
        ></div>

        <div v-else class="rounded-md border border-ink-200 bg-ink-300 p-4">
          <toggle-input
            :value="inferDefaultBranchCoverage"
            :remove-y-padding="true"
            input-width="xx-small"
            label="Enable report inference on the default branch"
            description="Ask DeepSource to re-use coverage reports from pull-requests after a merge. Turn this on if you don't run tests on your default branch commits."
            input-id="enable-infer-default-branch-coverage"
            @input="toggleInferDefaultBranchCoverage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZAlert, ZIcon } from '@deepsource/zeal'

import repositoryId from '~/apollo/queries/repository/id.gql'
import codeCoverage from '~/apollo/queries/repository/settings/codeCoverage.gql'
import updateInferDefaultBranchCoverage from '~/apollo/mutations/repository/settings/updateInferDefaultBranchCoverage.gql'

import { RepoPerms } from '~/types/permTypes'
import {
  CodeCoverageQueryVariables,
  Repository,
  RepositoryIdQueryVariables,
  RepositorySetting,
  UpdateRepositorySettingsInput
} from '~/types/types'

@Component({
  layout: 'repository',
  components: { ZAlert, ZIcon },
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.VIEW_CODE_COVERAGE_SETTINGS]
    }
  }
})
export default class SettingsCodeCoverage extends Vue {
  inferDefaultBranchCoverage = false
  hasTestCoverage = false
  repoId = ''
  dsn = ''

  async fetch() {
    const { provider, owner, repo: name } = this.$route.params

    try {
      const args: CodeCoverageQueryVariables = {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      }
      const res = await this.$fetchGraphqlData(codeCoverage, args)

      const repoDetails = res.data?.repository as Repository

      if (repoDetails) {
        this.hasTestCoverage = repoDetails?.hasTestCoverage ?? false

        this.inferDefaultBranchCoverage =
          repoDetails?.repositorySetting?.inferDefaultBranchCoverage ?? false

        this.repoId = repoDetails?.id ?? ''

        this.dsn = repoDetails?.dsn ?? ''
      } else {
        this.$toast.danger('Unable to fetch repository data. Please contact support.')
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch repository data. Please contact support.')
    }
  }

  async toggleInferDefaultBranchCoverage(newVal: boolean) {
    try {
      if (!this.repoId) {
        const { provider, owner, repo: name } = this.$route.params
        const args: RepositoryIdQueryVariables = {
          provider: this.$providerMetaMap[provider].value,
          owner,
          name
        }
        const res = await this.$fetchGraphqlData(repositoryId, args)
        this.repoId = res.data?.repository?.id
      }

      const args: UpdateRepositorySettingsInput = {
        id: this.repoId,
        inferDefaultBranchCoverage: newVal
      }
      const res = await this.$applyGraphqlMutation(updateInferDefaultBranchCoverage, {
        input: args
      })

      const updatedRepoSettings = res?.data?.updateRepositorySettings?.repository
        ?.repositorySetting as RepositorySetting

      if (
        updatedRepoSettings &&
        Object.prototype.hasOwnProperty.call(updatedRepoSettings, 'inferDefaultBranchCoverage')
      ) {
        this.inferDefaultBranchCoverage = updatedRepoSettings.inferDefaultBranchCoverage ?? newVal
      } else {
        this.$toast.danger('Unable to update code coverage preferences. Please contact support.')
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to update code coverage preferences. Please contact support.'
      )
    }
  }
}
</script>

<style scoped>
.h-infer-toggle {
  height: 95px;
}
</style>
