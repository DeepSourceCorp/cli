<template>
  <div class="p-4 flex flex-col space-y-6 max-w-3xl">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">Reporting</div>
    <div class="flex space-x-2 w-full relative">
      <!-- DSN -->
      <div class="flex space-x-3 items-center w-full relative">
        <div class="text-sm text-vanilla-100">Data Source Name (DSN)</div>
        <div class="flex-grow lg:min-w-80 relative">
          <z-input v-model="repository.dsn">
            <template slot="right">
              <z-button
                buttonType="secondary"
                size="small"
                spacing="px-2"
                class="flex space-x-2 items-center w-2/6"
                @click="copyDSN()"
              >
                <z-icon :icon="clipboardIcon" size="small"></z-icon>
                <span>{{ copyText }}</span>
              </z-button>
            </template>
          </z-input>
          <div
            v-if="hideContents"
            class="w-full h-full absolute top-0 backdrop-blur bg-ink-400 bg-opacity-10 flex justify-center items-center border border-ink-200"
          >
            <div
              class="flex space-x-2 leading-none items-center text-sm cursor-pointer"
              @click="showContents()"
            >
              <z-icon size="small" icon="eye" color="vanilla-100"></z-icon>
              <span>Reveal</span>
            </div>
            <button
              class="absolute w-36 right-0.5 text-xs flex space-x-2 justify-center items-center p-2 bg-ink-300 text-vanilla-100 rounded-sm h-8"
              @click="copyDSN()"
            >
              <z-icon :icon="clipboardIcon" size="small"></z-icon>
              <span>{{ copyText }}</span>
            </button>
          </div>
        </div>
        <div class="absolute top-0 left-full px-1">
          <info-banner>
            <p>
              This DSN should be used to send any external information about this repository to
              DeepSource from external sources, such as DeepSource CLI. Please keep this value
              confidential.
              <span class="text-vanilla-100 font-medium">Please keep this confidential.</span>
            </p>
          </info-banner>
        </div>
      </div>
    </div>
    <z-divider margin="mx-0 my-1"></z-divider>
    <div class="flex flex-col gap-y-4 relative">
      <div class="text-sm text-vanilla-100">Test Coverage</div>
      <!-- Notice -->
      <notice :enabled="repository.hasTestCoverage">
        <p v-if="repository.hasTestCoverage">
          Test coverage tracking is enabled, and we're ready to receive coverage data.
        </p>
        <p v-else>Test coverage has not been set up for this repository yet.</p>
      </notice>
      <div class="absolute top-0 left-full px-4">
        <info-banner>
          <p>
            For tracking test coverage, external data has to be sent to DeepSource. Read
            <a
              href="https://deepsource.io/docs/analyzer/test-coverage"
              target="_blank"
              rel="noopener noreferrer"
              class="text-juniper text-xs"
              >documentation</a
            >
            on configuration.
          </p>
        </info-banner>
      </div>
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

  public clipboardIcon = 'copy'

  public copyText = 'Click to copy'

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
        this.clipboardIcon = 'copy'
        this.copyText = 'Click to copy'
      }, 1000)
    }
  }
}
</script>
