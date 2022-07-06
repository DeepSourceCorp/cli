<template>
  <base-state title="The run couldn't finish in time">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/timeout.svg')"
        alt="Repo timeout"
      />
    </template>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Timeout empty state for Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunTimeout extends Vue {}
</script>
