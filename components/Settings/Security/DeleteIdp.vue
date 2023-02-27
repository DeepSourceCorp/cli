<template>
  <z-accordion class="text-vanilla-100 border border-ink-200 rounded-md bg-ink-300">
    <z-accordion-item title="Delete account" class="p-3">
      <template #title="{ open, toggleAccordion }">
        <div class="flex items-center cursor-pointer gap-1" @click="toggleAccordion">
          <z-icon
            icon="chevron-right"
            :class="
              open
                ? 'animate-first-quarter-spin rotate-90'
                : 'animate-reverse-quarter-spin rotate-0'
            "
            class="transform"
          />
          <span class="font-medium text-xs uppercase text-vanilla-400 tracking-wider"
            >SSO settings</span
          >
        </div>
      </template>
      <z-alert type="danger" class="mt-3 border border-cherry-500 border-opacity-20">
        <div>
          <z-button
            button-type="danger"
            color="ink-400"
            size="small"
            class="float-right flex gap-x-1 items-center"
            @click="$emit('confirm-idp-delete')"
          >
            <z-icon icon="trash-2" color="current" />
            Delete IdP
          </z-button>
          <p class="text-cherry text-sm leading-4">Delete Identity Provider</p>
          <p class="text-cherry-300 text-xs leading-6 mt-1.5">
            Delete your Single Sign-On Identity Provider
          </p>
        </div>
      </z-alert>
    </z-accordion-item>
  </z-accordion>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZAccordion, ZAccordionItem, ZAlert, ZButton, ZIcon } from '@deepsource/zeal'

@Component({ components: { ZAccordion, ZAccordionItem, ZAlert, ZButton, ZIcon } })
export default class DeleteIdp extends Vue {}
</script>
