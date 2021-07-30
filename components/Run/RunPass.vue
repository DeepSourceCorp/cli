<template>
  <base-state title="No Issues found in this Run">
    <template slot="hero">
      <div class="text-3xl text-center mb-4">🎉</div>
    </template>
    <p>Give yourself a cookie.</p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

@Component({ components: { BaseState } })
export default class RunLoading extends Vue {}
</script>
