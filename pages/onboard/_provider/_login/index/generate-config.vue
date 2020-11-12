<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Generate Config</span>
    <span class="text-md block">Provider: {{ $route.params.provider }}</span>
    <span class="text-md block">Login: {{ $route.params.login }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, namespace } from 'nuxt-property-decorator'

const runList = namespace('runList')

@Component
export default class GenerateConfig extends Vue {}
</script>
