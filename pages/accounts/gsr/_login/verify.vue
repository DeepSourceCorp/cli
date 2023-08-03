<template>
  <hero-card width="lg">
    <h1 class="text-center text-xl font-bold leading-snug text-vanilla-100">
      Verify your project configuration
    </h1>
    <section class="mt-8 space-y-5">
      <verification-step
        v-show="currentStep === 'TOKEN'"
        title="Verify OAuth token permissions"
        sequence="1"
        total="3"
        :is-complete="false"
        @switch="currentStep = 'TOKEN'"
      >
        <p class="text-sm text-vanilla-300">
          DeepSource uses the OAuth token generated with your signup to run analysis on your
          repositories.
        </p>
        <p class="text-sm text-vanilla-300">
          For DeepSource to run you need to have the following permissions for
          <b>{{ $route.params.login }}</b
          >.
        </p>
        <ul class="ml-7 list-decimal text-sm">
          <li v-for="perm in gsrPermsList" :key="perm.name">
            <code class="rounded-sm bg-ink-100 px-0.5 py-px leading-none">{{ perm.name }}</code>
          </li>
        </ul>
      </verification-step>
      <verification-step
        v-show="currentStep === 'WEBHOOK'"
        title="Turn on webhooks for the project"
        sequence="2"
        total="3"
        :is-complete="false"
        @switch="currentStep = 'WEBHOOK'"
      >
        <p class="text-sm text-vanilla-300">
          In order to enable webhooks you need to create a Pub/Sub topic, and a subscription for the
          topic. Once done you have to link that topic with the project
          <b>{{ $route.params.login }}</b
          >.
        </p>
        <p class="text-sm text-vanilla-300">The following is the URL for the webhook endpoint:</p>
        <client-only>
          <div
            class="hide-scroll flex items-center justify-between space-x-2 overflow-scroll rounded-md border border-slate-400 bg-ink-400 p-2"
          >
            <span class="default-scroll overflow-x-scroll font-mono text-sm text-vanilla-300">
              {{ webhookUrl }}
            </span>
            <copy-button :value="webhookUrl" :disabled="!webhookUrl" class="w-24 flex-shrink-0" />
          </div>
        </client-only>
        <p class="text-sm text-vanilla-300">
          You can find more information on
          <a
            target="_blank"
            rel="noopener noreferrer"
            class="text-center text-sm text-juniper hover:underline"
            href="https://cloud.google.com/source-repositories/docs/configuring-notifications"
          >
            Google Cloud documentation
          </a>
        </p>
      </verification-step>
      <verification-step
        v-show="currentStep === 'SSH'"
        title="Register the SSH key with the project on GCP"
        sequence="3"
        total="3"
        :is-complete="false"
        @switch="currentStep = 'SSH'"
      >
        <p class="text-vanilla-300">
          Go to the
          <a
            target="blank"
            rel="noopener noreferrer"
            class="text-center text-sm text-juniper hover:underline"
            href="https://source.cloud.google.com/user/ssh_keys?register=true"
          >
            Manage SSH keys
          </a>
          and add the register the following public key.
        </p>
        <div
          class="default-scroll max-h-24 overflow-scroll break-words rounded-md border border-slate-400 bg-ink-400 p-2 font-mono text-sm text-vanilla-300"
        >
          {{ owner.ownerSetting.publicKey }}
        </div>
        <div class="flex items-center">
          <copy-button
            :value="ownerPublicKey"
            :disabled="!ownerPublicKey"
            label="Copy public key"
            class="w-44"
          />
        </div>
      </verification-step>
      <div class="mt-5 flex items-center justify-end space-x-2">
        <z-button
          size="small"
          icon="arrow-left"
          button-type="secondary"
          label="Back to projects"
          @click="$router.push(['', 'accounts', 'gsr', 'projects'].join('/'))"
        />
        <z-button
          size="small"
          :is-loading="verifying"
          :disabled="verifying"
          :loading-label="`Verifying ${verifyButtonLabel}`"
          icon="check-circle"
          :label="`Verify ${verifyButtonLabel}`"
          @click="verifyStep"
        />
      </div>
    </section>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin from '~/mixins/authMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import {
  Maybe,
  TriggerVerifyGsrsshInput,
  TriggerVerifyGsrsshPayload,
  VcsProviderChoices,
  VerifyGsrPermissionsInput,
  VerifyGsrPermissionsPayload,
  VerifyGsrSetupInput,
  VerifyGsrSetupPayload,
  VerifyGsrWebhooksInput,
  VerifyGsrWebhooksPayload
} from '~/types/types'
import { OwnerDetailActions } from '~/store/owner/detail'

const ownerStore = namespace('owner/detail')

@Component({
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
export default class GSRInstallationVerify extends mixins(
  ContextMixin,
  ActiveUserMixin,
  OwnerDetailMixin,
  AuthMixin
) {
  @ownerStore.Action(OwnerDetailActions.VERIFY_GSR_PERMISSIONS)
  verifyGsrPerms: (args: VerifyGsrPermissionsInput) => Promise<VerifyGsrPermissionsPayload>

  @ownerStore.Action(OwnerDetailActions.VERIFY_GSR_WEBHOOKS)
  verifyGsrWebhooks: (args: VerifyGsrWebhooksInput) => Promise<VerifyGsrWebhooksPayload>

  @ownerStore.Action(OwnerDetailActions.VERIFY_GSR_SSH)
  verifyGsrSsh: (args: TriggerVerifyGsrsshInput) => Promise<TriggerVerifyGsrsshPayload>

  @ownerStore.Action(OwnerDetailActions.VERIFY_GSR_SETUP)
  verifyGsrSetup: (args: VerifyGsrSetupInput) => Promise<VerifyGsrSetupPayload>

  public steps: ('TOKEN' | 'WEBHOOK' | 'SSH')[] = ['TOKEN', 'WEBHOOK', 'SSH']
  public verifiedSteps: ('TOKEN' | 'WEBHOOK' | 'SSH')[] = []
  public currentStep: 'TOKEN' | 'WEBHOOK' | 'SSH' = this.steps[0]
  public verifying = false

  public gsrPermsList = [
    {
      name: 'source.repos.list',
      description: 'List repositories within a project.'
    },
    {
      name: 'source.repos.get',
      description: 'Clone, fetch, and browse repositories.'
    }
  ]

  get isWebhookVerified(): boolean {
    return false
  }

  async fetch(): Promise<void> {
    const { login } = this.$route.params
    await this.fetchOwnerDetails({ login, provider: VcsProviderChoices.Gsr })
    await this.fetchOwnerSSHKey({
      login: login,
      provider: VcsProviderChoices.Gsr
    })
  }

  get webhookUrl(): string {
    if (process.client) {
      return `https://${window.location.host}/services/webhooks/gsr`
    }
    return ''
  }

  get ownerPublicKey(): string {
    return this.owner.ownerSetting?.publicKey || ''
  }

  nextStep(): void {
    const nextStepIndex = this.steps.indexOf(this.currentStep) + 1
    if (nextStepIndex < this.steps.length) {
      this.currentStep = this.steps[nextStepIndex]
    }
  }

  prevStep(): void {
    const prevStepIndex = this.steps.indexOf(this.currentStep) - 1
    if (prevStepIndex >= 0) {
      this.currentStep = this.steps[prevStepIndex]
    }
  }

  get verifyButtonLabel(): string {
    if (this.currentStep === 'TOKEN') {
      return 'permissions'
    } else if (this.currentStep === 'WEBHOOK') {
      return 'webhook configuration'
    } else if (this.currentStep === 'SSH') {
      return 'SSH keys'
    }

    return 'Verify'
  }

  async verifyStep(): Promise<void> {
    const fnMap = {
      TOKEN: this.triggerVerifyGsrPerms,
      WEBHOOK: this.triggerVerifyGsrWebhooks,
      SSH: this.triggerVerifyGsrSsh
    }

    const verifyFunction = fnMap[this.currentStep]

    this.verifying = true
    try {
      const status = await verifyFunction()
      if (status) {
        this.verifiedSteps.push(this.currentStep)
        this.nextStep()

        if (this.verifiedSteps.length === this.steps.length) {
          this.finishVerification()
        }
      } else {
        this.$toast.danger('Verification failed, please check your configuration again')
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.verifying = false
    }
  }

  async triggerVerifyGsrPerms(): Promise<boolean> {
    const response = await this.verifyGsrPerms({ ownerId: this.owner.id })
    return Boolean(response.ok)
  }

  async triggerVerifyGsrWebhooks(): Promise<boolean> {
    const response = await this.verifyGsrWebhooks({ ownerId: this.owner.id })
    return Boolean(response.ok)
  }

  async triggerVerifyGsrSsh(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // Trigger SSH check
      const response = await this.verifyGsrSsh({ ownerId: this.owner.id })
      // If the status is pending
      if (response.status === 'pend') {
        let pollSshVerification: ReturnType<typeof setInterval>
        const { login } = this.$route.params

        const cleanUpAndResolve = () => {
          // Clear the interval and switch off websockets
          clearInterval(pollSshVerification)
          this.$socket.$off('gsr-ssh-verification')
          resolve(true)
        }

        // Start websocket listener
        this.$socket.$on('gsr-ssh-verification', (data: { status?: Maybe<string> }) => {
          if (data.status !== 'pend') {
            cleanUpAndResolve()
          }
        })

        // Start polling ever 2.5 seconds
        pollSshVerification = setInterval(async () => {
          await this.fetchOwnerDetails({
            login: login,
            provider: 'gsr',
            refetch: true
          })
          if (this.owner.isGsrSshRegistered) {
            cleanUpAndResolve()
          }
        }, 2500)
      } else {
        resolve(true)
      }
    })
  }

  async triggerVerifyGsrSetup(): Promise<boolean> {
    const response = await this.verifyGsrSetup({ ownerId: this.owner.id })
    return Boolean(response.ok)
  }

  async finishVerification(): Promise<void> {
    const { login } = this.$route.params
    const { ok } = await this.verifyGsrSetup({ ownerId: this.owner.id })
    await this.fetchOwnerDetails({ provider: 'gsr', login, refetch: true })

    if (ok) {
      this.$toast.success('Verification successful, redirecting you to onboarding')
      this.$router.push(['', 'onboard', 'gsr', login, 'issue-type'].join('/'))
    } else {
      this.$toast.danger('Verification failed, please check your configuration again')
    }
  }
}
</script>
