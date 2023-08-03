<template>
  <div
    class="flex gap-3 rounded-md border border-honey-500 border-opacity-10 bg-honey-500 bg-opacity-5 p-4 text-honey-300"
  >
    <z-icon icon="security" color="current" class="flex-shrink-0" />
    <div class="flex-grow">
      <div class="text-xs font-medium leading-4">Report a security vulnerability</div>
      <div class="mt-1.5 text-xs leading-6 text-honey-400">
        Please send us an email at
        <a
          href="mailto:security@deepsource.io"
          class="rounded-sm bg-honey-500 bg-opacity-10 px-0.5 py-px font-medium text-honey-200"
          >security@deepsource.io</a
        >
        with the details of your findings. We will triage the issue and get back to you. Please also
        read out Responsible Disclosure Policy for more information.
      </div>
      <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-4">
        <z-button
          to="mailto:security@deepsource.io"
          button-type="warning"
          icon="mail"
          label="Email DeepSource"
          size="small"
        />
        <a
          href="https://deepsource.com/security#responsible-disclosure"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-x-1 text-xs text-honey-200 hover:text-honey-100 focus:text-honey-100"
        >
          <span>Responsible Disclosure Policy</span>
          <z-icon icon="arrow-up-right" color="current" size="x-small" />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ name: 'SupportSecurityWarning' })
export default class SupportSecurityWarning extends Vue {}
</script>
