<template>
  <portal to="modal">
    <z-modal title="Activate analysis" @onClose="$emit('close')">
      <section class="p-4">
        <div class="text-sm leading-relaxed text-vanilla-400">
          To activate analysis, DeepSource will
          {{
            repository.isCommitPossible
              ? 'commit the following'
              : `create a ${pullLabel} request with the following`
          }}
          configuration in a <span class="font-mono text-vanilla-200">.deepsource.toml</span> file.
          <div class="p-3 text-xs rounded-md my-3 bg-ink-200">
            <highlightjs language="toml" :code="toml" />
          </div>
        </div>
        <p class="text-sm leading-relaxed text-vanilla-400">
          You can also update the configuration using the
          <nuxt-link class="text-juniper hover:underline" :to="$generateRoute(['generate-config'])">
            config generator.
          </nuxt-link>
        </p>
      </section>
      <template v-slot:footer="{ close }">
        <div class="p-4 space-x-4 text-right text-vanilla-100 border-ink-200">
          <z-button
            v-if="repository.isCommitPossible"
            :isLoading="triggeringActivation"
            :disabled="triggeringActivation"
            icon="play-circle"
            class="modal-primary-action"
            buttonType="primary"
            size="small"
            :label="`Commit config to ${$providerMetaMap[repository.vcsProvider].text}`"
            loadingLabel="Adding configuration"
            @click="commitConfig(close)"
          />
          <z-button
            v-else
            :isLoading="triggeringActivation"
            :disabled="triggeringActivation"
            icon="git-pull-request"
            class="modal-primary-action"
            buttonType="primary"
            size="small"
            :label="`Create ${pullLabel} request with config`"
            :loadingLabel="`Creating ${pullLabel} request`"
            @click="commitConfig(close, true)"
          />
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { ZModal, ZInput, ZCheckbox, ZToggle, ZButton } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import TomlGeneratorMixin from '~/mixins/tomlGeneratorMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoListMixin from '~/mixins/repoListMixin'

@Component({
  components: {
    ZModal,
    ZInput,
    ZCheckbox,
    ZToggle,
    ZButton
  }
})
export default class ActivateAnalysisModal extends mixins(
  RepoDetailMixin,
  TomlGeneratorMixin,
  ActiveUserMixin,
  RepoListMixin
) {
  triggeringActivation = false
  copyIcon = 'clipboard'
  copyIconColor = 'vanilla-400'

  get toml(): string {
    return this.tomlTemplate(
      this.repository.config,
      this.repository.config['test_patterns'],
      this.repository.config['exclude_patterns']
    )
  }

  get pullLabel(): string {
    return this.$route.params.provider === 'gl' ? 'merge' : 'pull'
  }

  copyToml(): void {
    this.$copyToClipboard(this.toml)
    this.copyIcon = 'check'
    this.copyIconColor = 'juniper'
    setTimeout(() => {
      this.copyIcon = 'clipboard'
      this.copyIconColor = 'vanilla-400'
    }, 800)
  }

  async refetchData(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchActiveAnalysisRepoList({
      login: owner,
      provider,
      limit: 10,
      refetch: true
    })

    await this.fetchPendingAdHocRepoList({
      login: owner,
      provider,
      refetch: true
    })
  }

  async commitConfig(close: () => void, createPullRequest = false): Promise<void> {
    const args = {
      config: this.toml,
      repositoryId: this.repository.id,
      createPullRequest
    }

    try {
      const response = await this.commitConfigToVcs(args)
      if (response.ok) {
        await this.refetchData()
        await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
        close()
        if (createPullRequest) {
          this.$toast.show({
            type: 'success',
            message: `We have created a ${this.pullLabel} request with the configuration. Analysis will start once it is commited.`,
            timeout: 5
          })
        } else {
          this.$toast.show({
            type: 'success',
            message: `Successfully activated ${this.repository.name}, the first run may take a while to finish.`,
            timeout: 5
          })
        }
      } else {
        this.$toast.show({
          type: 'danger',
          message: `Something went wrong while creating the configuration for this repository, please contact support.`,
          timeout: 10
        })
      }
    } catch (e) {
      this.logSentryErrorForUser(e as Error, 'Generate config', args)
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
      this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    }
  }

  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
