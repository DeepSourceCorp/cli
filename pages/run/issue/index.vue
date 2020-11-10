<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/run"
        >Go back to run</nuxt-link
      >
      <h1 class="text-2xl mb-5">Concrete Issue</h1>

      {{ $route.params.issue }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {} from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import {} from '~/types/types'

const run = namespace('run')

@Component
export default class ConcreteIssue extends Vue {}
</script>
