<template>
  <div class="juniper-highlight-card">
    <div class="space-y-1.5">
      <p class="text-sm leading-4 text-juniper-300">Security features are on the Enterprise plan</p>
      <p class="text-xs leading-6 text-juniper-150">
        Upgrade to Enterprise to access security features like configuring SSO for your workspace.
      </p>
    </div>
    <z-button
      button-type="primary"
      icon="zap"
      label="Update plan"
      size="small"
      to="/schedule-demo/"
      target="_blank"
      rel="noopener noreferrer"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZButton } from '@deepsource/zeal'

@Component({ components: { ZButton } })
export default class UpgradeToEnterprise extends Vue {}
</script>

<style scoped lang="postcss">
.juniper-highlight-card {
  @apply flex gap-x-16 justify-between rounded-md p-4 border;
  background-color: rgba(51, 203, 154, 0.06);
  border-color: rgba(51, 203, 154, 0.1);
}
</style>
