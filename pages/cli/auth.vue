<template>
  <hero-card width="lg">
    <div class="text-center">
      <h1 class="text-2xl font-bold leading-snug text-vanilla-100">DeepSource CLI</h1>
      <p class="mt-4 text-base text-vanilla-400">Enter the code displayed on your terminal.</p>
      <div class="mt-8">
        <div class="grid grid-cols-9 gap-2">
          <template v-for="(digit, idx) in otpDigits">
            <div
              v-if="idx === 4"
              :key="idx"
              class="grid h-12 place-content-center text-vanilla-100"
            >
              –
            </div>
            <input
              v-else
              :id="`cli-otp-input-${idx}`"
              :key="idx"
              v-model="otpDigits[idx]"
              maxlength="1"
              autocomplete="off"
              :disabled="freeze"
              class="h-12 rounded-md border border-slate-400 bg-ink-400 p-1 text-center font-bold text-vanilla-100 focus:outline-none active:border-juniper"
              placeholder=""
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
        class="mt-3 text-sm font-semibold"
        :class="['failed', 'passed'].includes(status) ? 'visible' : 'invisible'"
      >
        <p v-if="status === 'failed'" class="rounded-md bg-cherry bg-opacity-10 p-2 text-cherry">
          Something went wrong while authenticating your device.
        </p>
        <p
          v-else-if="status === 'passed'"
          class="rounded-md bg-juniper bg-opacity-10 p-2 text-juniper"
        >
          Authentication is completed. You may close this window..
        </p>
      </div>
      <z-button
        v-if="status === 'loading'"
        icon="spin-loader"
        icon-color="ink-400 animate-spin"
        class="mt-4 mt-8 w-80"
        :disabled="true"
        >Authenticating</z-button
      >
      <z-button
        v-else-if="status === 'failed'"
        icon="user-plus"
        class="mt-4 mt-8 w-80"
        @click="submitCode"
        >Try again</z-button
      >
      <z-button
        v-else-if="status === 'passed'"
        icon="user-check"
        disabled="true"
        class="mt-4 mt-8 w-80"
        >Authentication successful</z-button
      >
      <z-button v-else icon="user-plus" class="mt-4 mt-5 w-80" @click="submitCode"
        >Authenticate</z-button
      >
      <p class="mt-4 text-sm text-vanilla-400">
        Need help? Write to us at
        <a
          :href="`mailto:${$config.supportEmail}`"
          class="cursor-pointer text-juniper hover:underline"
          >{{ $config.supportEmail }}</a
        >
      </p>
    </div>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import VerifyDeviceMutation from '~/apollo/mutations/cli/verifyDevice.gql'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

@Component({
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
