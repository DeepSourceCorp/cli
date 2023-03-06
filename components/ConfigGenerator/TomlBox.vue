<template>
  <div>
    <div class="overflow-x-scroll text-sm rounded-md toml-box hide-scroll bg-ink-300">
      <div class="sticky top-0 left-0 flex items-start p-3 space-x-2 bg-ink-200">
        <p v-if="$slots.message" class="text-vanilla-400">
          <slot name="message"></slot>
        </p>
        <copy-button
          :value="toml"
          :disabled="!toml"
          button-type="ghost"
          :icon-only="true"
          v-tooltip="{
            placement: 'top',
            content: 'Copy to clipboard',
            delay: { show: 700, hide: 100 },
            classes: 'shadow-lg'
          }"
          class="hover:bg-vanilla-400 hover:bg-opacity-5"
        />
      </div>
      <div class="p-3 text-sm min-h-44 bg-ink-300">
        <highlightjs language="toml" :code="toml" />
      </div>
    </div>
    <template v-if="$route.params.provider === 'gsr'">
      <z-button
        @click="commitGSRConfigToVCS"
        button-type="primary"
        class="w-full"
        icon="zap"
        :disabled="actionDisabled"
      >
        Add configuration and start analysis
      </z-button>
    </template>
    <template v-else-if="canBeActivated || isActivated">
      <z-button
        v-if="isCommitPossible"
        @click="commitConfigToVCS(false)"
        button-type="primary"
        class="w-full"
        icon="zap"
        :disabled="actionDisabled"
      >
        Add configuration and start analysis
      </z-button>
      <z-button
        v-else-if="isAutofixEnabled"
        button-type="primary"
        class="w-full"
        icon="git-pull-request"
        :disabled="actionDisabled"
        @click="commitConfigToVCS(true)"
      >
        Create {{ $route.params.provider === 'gl' ? 'merge' : 'pull' }} request with config
      </z-button>
      <z-button
        v-else
        button-type="primary"
        class="w-full"
        icon="arrow-up-right"
        :disabled="actionDisabled"
        @click="toggleNextSteps()"
      >
        Show next steps
      </z-button>
      <z-button button-type="secondary" class="w-full" @click="activateRepo">
        I’ve added deepsource.toml, activate repo
      </z-button>
    </template>
    <template v-else-if="canViewerUpgrade">
      <nuxt-link
        class="block"
        :to="['', $route.params.provider, $route.params.owner, 'settings', 'billing'].join('/')"
      >
        <z-button icon="arrow-up" button-type="primary" class="w-full">
          Upgrade to Activate this Repo
        </z-button>
      </nuxt-link>
      <p class="text-sm text-center text-vanilla-400">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
    <template v-else>
      <z-button button-type="secondary" class="w-full" :disabled="true">
        Unavailable in current plan
      </z-button>
      <p class="text-sm text-center text-vanilla-400">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsource/zeal'

@Component({
  components: {
    ZButton,
    ZIcon
  }
})
export default class TomlBox extends Vue {
  @Prop({ required: true })
  toml: string

  @Prop({ default: false })
  actionDisabled: boolean

  @Prop({ default: false })
  isActivated: boolean

  @Prop({ default: false })
  canBeActivated: boolean

  @Prop({ default: false })
  canViewerUpgrade: boolean

  @Prop({ default: false })
  isCommitPossible: boolean

  @Prop({ default: false })
  isAutofixEnabled: boolean

  activateRepo(): void {
    this.$emit('activateRepo')
  }

  toggleNextSteps(): void {
    this.$emit('toggleNextSteps')
  }

  commitConfigToVCS(createPullRequest = false): void {
    this.$emit('commitConfig', createPullRequest)
  }

  commitGSRConfigToVCS(): void {
    this.$emit('commitGSR')
  }
}
</script>
