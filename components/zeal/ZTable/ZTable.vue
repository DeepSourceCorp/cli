<template>
  <table class="z-table w-full border-collapse border border-ink-200 p-8">
    <thead class="w-full">
      <slot name="head"></slot>
    </thead>
    <tbody class="w-full">
      <slot name="body"></slot>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'ZTable'
}
</script>
