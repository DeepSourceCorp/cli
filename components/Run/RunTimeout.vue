<template>
  <base-state title="The run couldn't finish in time">
    <template slot="hero">
      <div class="text-3xl text-center mb-4">⏲</div>
    </template>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

@Component({ components: { BaseState } })
export default class RunLoading extends Vue {}
</script>
