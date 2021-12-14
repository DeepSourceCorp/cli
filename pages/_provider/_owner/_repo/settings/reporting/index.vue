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
            <z-input id="repo-setting-dsn" :read-only="true" v-model="repository.dsn" class="mt-2">
              <template slot="right">
                <z-button
                  button-type="secondary"
                  size="small"
                  spacing="px-2"
                  class="flex items-center space-x-2"
                  @click="copyDSN()"
                >
                  <z-icon :icon="clipboardIcon" size="small"></z-icon>
                  <span>{{ copyText }}</span>
                </z-button>
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
            <div
              class="flex items-center gap-x-2 text-sm leading-none cursor-pointer mx-auto"
              @click="showContents()"
            >
              <z-icon size="small" icon="eye" color="vanilla-100"></z-icon>
              <span>Reveal</span>
            </div>
            <z-button
              buttonType="secondary"
              size="small"
              spacing="px-2"
              :icon="clipboardIcon"
              @click="copyDSN()"
              >{{ copyText }}
            </z-button>
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

  public clipboardIcon = 'clipboard'

  public copyText = 'Copy'

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

  public copyDSN(): void {
    if (this.repository.dsn) {
      this.$copyToClipboard(this.repository.dsn)
      this.clipboardIcon = 'check'
      this.copyText = 'Copied'
      setTimeout(() => {
        this.clipboardIcon = 'clipboard'
        this.copyText = 'Copy'
      }, 1000)
    }
  }
}
</script>
