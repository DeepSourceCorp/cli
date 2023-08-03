<template>
  <div id="tabs" class="flex border-b border-slate-400 pb-0 pt-2.5 xl:col-span-2">
    <div class="flex flex-nowrap space-x-5 self-end overflow-auto px-2 md:px-4">
      <template v-for="settings in settingsOptions">
        <nuxt-link :key="settings.name" :to="settings.route">
          <z-tab
            :is-active="$route && $route.name && $route.name.startsWith(settings.routeName)"
            border-active-color="vanilla-400"
            class="flex items-center space-x-1"
            :class="settings.isBeta ? 'pb-2.5' : ''"
          >
            <span>
              {{ settings.label }}
            </span>
            <z-tag
              v-if="settings.isBeta"
              :bg-color="
                $route && $route.name && $route.name.startsWith(settings.routeName)
                  ? 'ink-200'
                  : 'ink-200 opacity-50'
              "
              text-size="xxs"
              spacing="px-2 py-1"
              class="font-semibold uppercase leading-none tracking-wider text-current"
            >
              Beta
            </z-tag>
          </z-tab>
        </nuxt-link>
      </template>
    </div>
  </div>
</template>
