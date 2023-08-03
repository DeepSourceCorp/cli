<template>
  <div class="z-list flex flex-col">
    <slot name="title">
      <div class="font-medium">{{ title }}</div>
    </slot>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'ZList',
  props: {
    title: {
      type: String
    }
  }
}
</script>
