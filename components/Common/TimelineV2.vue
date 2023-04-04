<template>
  <ul>
    <slot></slot>
  </ul>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({ name: 'TimelineV2' })
export default class TimelineV2 extends Vue {}
</script>
