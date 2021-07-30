<template>
  <div class="bg-ink-400 text-vanilla-100 min-h-screen flex items-center justify-center">
    <div class="text-center space-y-5 max-w-xl">
      <h1 class="text-7xl font-black text-center">{{ error.statusCode }}</h1>
      <p class="text-center text-vanilla-100 font-semibold text-lg">{{ error.message }}</p>
      <p v-if="error.statusCode === 404" class="text-vanilla-400">
        Just like the Loch Ness monster, Big Foot, and the theory that says '404' was named after a
        room at CERN where the original (and the first) web servers were located.
      </p>
      <div class="flex items-center justify-center space-x-3">
        <NuxtLink class="text-center text-juniper text-sm hover:underline" to="/"
          >Home page</NuxtLink
        >
        <NuxtLink class="text-center text-juniper text-sm hover:underline" to="/login"
          >Login</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  layout: 'error' // you can set a custom layout for the error page
}
</script>
