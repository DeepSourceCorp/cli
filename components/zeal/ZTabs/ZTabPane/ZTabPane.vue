<template>
  <div :key="Math.random().toString(36).substring(7)" class="z-tab-pane">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZTabPane'
}
</script>
