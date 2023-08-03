<template>
  <div>
    <div class="toml-box hide-scroll overflow-x-scroll rounded-md bg-ink-300 text-sm">
      <div class="sticky left-0 top-0 flex items-start space-x-2 bg-ink-200 p-3">
        <p v-if="$slots.message" class="text-vanilla-400">
          <slot name="message"></slot>
        </p>
        <copy-button
          v-tooltip="{
            placement: 'top',
            content: 'Copy to clipboard',
            delay: { show: 700, hide: 100 },
            classes: 'shadow-lg'
          }"
          button-type="ghost"
          :value="toml"
          :disabled="!toml"
          :icon-only="true"
          class="hover:bg-vanilla-400 hover:bg-opacity-5"
        />
      </div>
      <div class="min-h-44 bg-ink-300 p-3 text-sm">
        <highlightjs language="toml" :code="toml" />
      </div>
    </div>
    <template v-if="$route.params.provider === 'gsr'">
      <z-button
        :disabled="primaryActionDisabled"
        icon="zap"
        class="w-full"
        @click="commitGSRConfigToVCS"
      >
        Add configuration and start analysis
      </z-button>
    </template>
    <template v-else-if="canBeActivated || isActivated">
      <z-button
        v-if="isCommitPossible"
        :disabled="primaryActionDisabled"
        icon="zap"
        class="w-full"
        @click="commitConfigToVCS(false)"
      >
        Add configuration and start analysis
      </z-button>
      <z-button
        v-else-if="isAutofixEnabled"
        :disabled="primaryActionDisabled"
        icon="git-pull-request"
        class="w-full"
        @click="commitConfigToVCS(true)"
      >
        Create {{ $route.params.provider === 'gl' ? 'merge' : 'pull' }} request with config
      </z-button>
      <z-button
        v-else
        :disabled="primaryActionDisabled"
        icon="arrow-up-right"
        class="w-full"
        @click="toggleNextSteps()"
      >
        Show next steps
      </z-button>
      <z-button
        :disabled="secondaryActionDisabled"
        button-type="secondary"
        class="w-full"
        @click="activateRepo"
      >
        I’ve added .deepsource.toml, activate repo
      </z-button>
    </template>
    <template v-else-if="canViewerUpgrade">
      <nuxt-link
        :to="['', $route.params.provider, $route.params.owner, 'settings', 'billing'].join('/')"
        class="block"
      >
        <z-button icon="arrow-up" class="w-full"> Upgrade to Activate this Repo </z-button>
      </nuxt-link>
      <p class="text-center text-sm text-vanilla-400">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
    <template v-else>
      <z-button :disabled="true" button-type="secondary" class="w-full">
        Unavailable in current plan
      </z-button>
      <p class="text-center text-sm text-vanilla-400">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class TomlBox extends Vue {
  @Prop({ required: true })
  toml: string

  @Prop({ default: false })
  primaryActionDisabled: boolean

  @Prop({ default: false })
  secondaryActionDisabled: boolean

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
