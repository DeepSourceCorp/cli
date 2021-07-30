<template>
  <hero-card width="lg">
    <div class="text-center">
      <h1 class="text-vanilla-100 font-bold text-2xl leading-snug">DeepSource CLI</h1>
      <p class="text-vanilla-400 text-base mt-4">Enter the code displayed on your terminal.</p>
      <div class="mt-8">
        <div class="grid grid-cols-9 gap-2">
          <template v-for="(digit, idx) in otpDigits">
            <div
              :key="idx"
              v-if="idx === 4"
              class="h-12 text-vanilla-100 grid place-content-center"
            >
              –
            </div>
            <input
              v-else
              v-model="otpDigits[idx]"
              maxlength="1"
              autocomplete="off"
              :disabled="freeze"
              class="p-1 bg-ink-400 rounded-md border border-ink-200 active:border-juniper focus:outline-none text-vanilla-100 font-bold text-center h-12"
              placeholder=""
              :id="`cli-otp-input-${idx}`"
              :key="idx"
              @keydown.delete.prevent="deleteHandler()"
              @input="handleInput"
              @blur="activeIndex = -1"
              @focus="activeIndex = idx"
              @paste.prevent="handleOnPaste"
            />
          </template>
        </div>
      </div>
      <div
        class="text-sm font-semibold mt-3"
        :class="['failed', 'passed'].includes(status) ? 'visible' : 'invisible'"
      >
        <p v-if="status === 'failed'" class="text-cherry p-2 bg-cherry bg-opacity-10 rounded-md">
          Something went wrong while authenticating your device.
        </p>
        <p
          v-else-if="status === 'passed'"
          class="text-juniper p-2 bg-juniper bg-opacity-10 rounded-md"
        >
          Authentication is completed. You may close this window..
        </p>
      </div>
      <z-button
        v-if="status === 'loading'"
        icon="spin-loader"
        iconColor="ink-400 animate-spin"
        class="mt-4 w-80 mt-8"
        :disabled="true"
        >Authenticating</z-button
      >
      <z-button
        v-else-if="status === 'failed'"
        icon="user-plus"
        class="mt-4 w-80 mt-8"
        @click="submitCode"
        >Try again</z-button
      >
      <z-button
        v-else-if="status === 'passed'"
        icon="user-check"
        disabled="true"
        class="mt-4 w-80 mt-8"
        >Authentication successful</z-button
      >
      <z-button v-else icon="user-plus" class="mt-4 w-80 mt-5" @click="submitCode"
        >Authenticate</z-button
      >
      <p class="text-vanilla-400 mt-4 text-sm">
        Need help? Write to us at
        <a
          :href="`mailto:${$config.supportEmail}`"
          class="text-juniper hover:underline cursor-pointer"
          >{{ $config.supportEmail }}</a
        >
      </p>
    </div>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import VerifyDeviceMutation from '~/apollo/mutations/cli/verifyDevice.gql'
import { ZButton, ZInput } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

@Component({
  components: {
    ZButton,
    ZInput
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class CLIAuth extends mixins(ContextMixin, ActiveUserMixin) {
  activeIndex = 0
  freeze = false
  status = ''

  otpDigits = ['', '', '', '', '-', '', '', '', '']

  mounted() {
    const { user_code } = this.$route.query
    if (user_code) {
      this.setOTP((user_code as string).split(''))
    }
  }

  focusInput(index: number) {
    this.activeIndex = Math.max(Math.min(8, index), 0)
  }

  @Watch('activeIndex')
  setFocus() {
    const el = document.getElementById(`cli-otp-input-${this.activeIndex}`)
    if (el) {
      el.focus()
    }
  }

  async submitCode() {
    this.status = 'loading'
    const code = this.otpDigits.join('').split('-').join('')
    const input = { userCode: code, accepted: true }
    try {
      await this.$applyGraphqlMutation(VerifyDeviceMutation, { input })
      this.status = 'passed'
      this.freeze = true
    } catch (e) {
      this.status = 'failed'
    }
  }

  handleInput() {
    this.otpDigits = this.otpDigits.map((digit) => {
      return digit.toUpperCase()
    })
    this.focusNext()
  }

  focusNext() {
    const newIndex = this.activeIndex + 1
    this.focusInput(newIndex === 4 ? 5 : newIndex)
  }

  focusPrev() {
    const newIndex = this.activeIndex - 1
    this.focusInput(newIndex === 4 ? 3 : newIndex)
  }

  deleteHandler() {
    this.otpDigits = this.otpDigits.map((digit, idx) => {
      return idx === this.activeIndex ? '' : digit
    })
    this.focusPrev()
  }

  handleOnPaste(event: ClipboardEvent) {
    event.preventDefault()
    const pastedData = event.clipboardData?.getData('text/plain').slice(0).split('')
    if (pastedData) {
      this.setOTP(pastedData)
    }
  }

  setOTP(otp: string[]) {
    otp.splice(4, 0, '-')
    this.otpDigits = this.otpDigits.map((digit, idx) => {
      if (idx === 4) {
        return '-'
      }
      return otp[idx] ? otp[idx] : digit
    })
  }
}
</script>
