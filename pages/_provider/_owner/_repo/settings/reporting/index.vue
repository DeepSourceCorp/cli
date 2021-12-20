<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <h2 class="text-lg font-medium mb-4">Reporting</h2>

    <!-- DSN -->
    <div class="grid gap-4">
      <div class="col-span-full md:col-auto">
        <div class="relative">
          <label for="repo-setting-dsn" class="text-sm text-vanilla-100">
            Data Source Name (DSN)
            <z-input :value="repository.dsn" id="repo-setting-dsn" :read-only="true" class="mt-2">
              <template slot="right">
                <copy-button :value="repository.dsn" :disabled="!repository.dsn" class="w-32" />
              </template>
            </z-input>
          </label>
          <div
            v-if="hideContents"
            class="
              absolute
              top-8
              flex
              items-center
              justify-between
              p-2
              w-full
              h-10
              border
              backdrop-blur
              bg-ink-400 bg-opacity-10
              no-filter:bg-opacity-100
              border-ink-200
            "
          >
            <button
              class="flex items-center gap-x-2 text-sm leading-none cursor-pointer mx-auto"
              @click="showContents()"
            >
              <z-icon size="small" icon="eye" color="vanilla-100"></z-icon>
              <span>Reveal</span>
            </button>
            <copy-button :value="repository.dsn" :disabled="!repository.dsn" class="w-26" />
          </div>
        </div>
      </div>
      <p class="text-xs text-vanilla-400 leading-5">
        This DSN should be used to send any external information about this repository to DeepSource
        from external sources, such as DeepSource CLI.
        <span class="font-medium text-vanilla-100">Please keep this confidential.</span>
      </p>
    </div>

    <z-divider margin="my-2" class="max-w-2xl" />

    <div class="flex flex-col gap-y-4">
      <div class="text-sm text-vanilla-100">Test Coverage</div>
      <!-- Notice -->
      <p class="text-xs text-vanilla-400 leading-5">
        For tracking test coverage, external data has to be sent to DeepSource. Read
        <a
          href="https://deepsource.io/docs/analyzer/test-coverage"
          target="_blank"
          rel="noopener noreferrer"
          class="text-juniper"
          >documentation</a
        >
        on configuration.
      </p>
      <notice class="items-baseline" :enabled="repository.hasTestCoverage">
        <p v-if="repository.hasTestCoverage" class="relative top-px">
          Test coverage tracking is enabled, and we're ready to receive coverage data.
        </p>
        <p v-else class="relative top-px">
          Test coverage has not been set up for this repository yet.
        </p>
      </notice>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, namespace } from 'nuxt-property-decorator'
import { Notice } from '@/components/Settings/index'
import { ZDivider, ZInput, ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { Repository } from '~/types/types'
import { InfoBanner } from '@/components/Settings/index'
import { RepoPerms } from '~/types/permTypes'

const repoStore = namespace('repository/detail')

@Component({
  components: {
    Notice,
    ZDivider,
    ZInput,
    ZIcon,
    ZButton,
    InfoBanner
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.VIEW_DSN]
    }
  }
})
export default class Reporting extends Vue {
  @repoStore.State
  repository!: Repository

  public hideContents = true

  async fetch(): Promise<void> {
    await this.$store.dispatch(
      `repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_REPORTING}`,
      {
        provider: this.$route.params.provider,
        owner: this.$route.params.owner,
        name: this.$route.params.repo
      }
    )
  }

  public showContents(): void {
    this.hideContents = false
  }
}
</script>
