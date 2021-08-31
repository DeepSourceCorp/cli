<template>
  <div>
    <div class="toml-box hide-scroll overflow-x-hidden text-sm rounded-md bg-ink-300">
      <div class="flex space-x-2 sticky top-0 bg-ink-200 items-start p-3">
        <p v-if="$slots.message" class="text-vanilla-400">
          <slot name="message"></slot>
        </p>
        <button
          @click="copyToml"
          v-tooltip="{
            placement: 'top',
            content: 'Copy to Clipboard',
            delay: { show: 700, hide: 100 },
            classes: 'shadow-lg'
          }"
          class="cursor-pointer p-1 hover:bg-ink-100 rounded-md"
        >
          <z-icon
            :icon="copyIcon"
            :color="copyIconColor"
            class="cursor-pointer motion-reduce:transition-none motion-reduce:transform-none duration-75"
          ></z-icon>
        </button>
      </div>
      <div class="p-3 text-sm min-h-44 bg-ink-300">
        <highlightjs language="toml" :code="toml" />
      </div>
    </div>
    <template v-if="canBeActivated || isActivated">
      <z-button
        v-if="isCommitPossible"
        @click="commitConfigToVCS(false)"
        buttonType="primary"
        class="w-full"
        :disabled="actionDisabled"
      >
        Add configuration and start analysis
      </z-button>
      <z-button
        v-else-if="isAutofixEnabled"
        buttonType="primary"
        class="w-full"
        :disabled="actionDisabled"
        @click="commitConfigToVCS(true)"
      >
        Create {{ $route.params.provider === 'gl' ? 'merge' : 'pull' }} request with config
      </z-button>
      <z-button
        v-else
        buttonType="primary"
        class="w-full"
        :disabled="actionDisabled"
        @click="toggleNextSteps()"
      >
        Show next steps
      </z-button>
      <z-button buttonType="secondary" class="w-full" @click="activateRepo">
        I’ve added deepsource.toml, activate repo
      </z-button>
    </template>
    <template v-else-if="canViewerUpgrade">
      <nuxt-link
        class="block"
        :to="['', $route.params.provider, $route.params.owner, 'settings', 'billing'].join('/')"
      >
        <z-button icon="arrow-up" buttonType="primary" class="w-full">
          Upgrade to Activate this Repo
        </z-button>
      </nuxt-link>
      <p class="text-vanilla-400 text-sm text-center">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
    <template v-else>
      <z-button buttonType="secondary" class="w-full" :disabled="true">
        Unavailable in current plan
      </z-button>
      <p class="text-vanilla-400 text-sm text-center">
        You have reached the limit for the number of private repositories you can activate on this
        account, please upgrade to start analysis on this repository.
      </p>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'

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

  private copyIcon = 'clipboard'
  private copyIconColor = 'vanilla-400'

  activateRepo(): void {
    this.$emit('activateRepo')
  }

  toggleNextSteps(): void {
    this.$emit('toggleNextSteps')
  }

  commitConfigToVCS(createPullRequest = false): void {
    this.$emit('commitConfig', createPullRequest)
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
}
</script>
