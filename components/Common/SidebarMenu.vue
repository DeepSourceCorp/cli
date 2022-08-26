<template>
  <div class="sidebar-menu" v-outside-click="closeSidebar">
    <!-- Sidebar modal -->
    <div
      class="absolute top-0 z-30 flex flex-col h-screen duration-200 cursor-pointer transition-width group bg-ink-400 sidebar-menu border-ink-200 text-vanilla-100"
      :class="[modalWidth, directionClasses, borderClasses, isOpen && 'shadow-black']"
    >
      <!-- Hover Gradient border -->
      <div
        v-if="collapsible"
        class="absolute top-0 hidden w-px h-full lg:group-hover:block -right-px bg-gradient-juniper"
      ></div>
      <header class="relative w-full" v-if="$scopedSlots.header">
        <slot name="header" :isCollapsed="isCollapsed"></slot>
        <div
          v-if="collapsible"
          class="relative hidden p-1 -translate-y-1/2 rounded-full lg:group-hover:block bg-juniper lg:absolute top-full transform-gpu"
          @click.stop="collapseSidebar()"
          :class="[hoverStyle]"
        >
          <z-icon :icon="arrow" size="small" color="ink-400" boxWidth="16"></z-icon>
        </div>
      </header>
      <div class="flex justify-center w-full px-2">
        <slot name="subHeader" :isCollapsed="isCollapsed"></slot>
      </div>
      <div
        class="flex-1 w-full px-2 pt-2 pb-4 sidebar-items"
        :class="{
          'custom-y-scroll': !isCollapsed
        }"
      >
        <slot :isCollapsed="isCollapsed"></slot>
      </div>
      <footer
        class="w-full p-3 border-t border-solid border-ink-200 bg-gradient-dark-dawn backdrop-blur-xl"
        :class="footerClass"
        v-if="$scopedSlots.footer"
      >
        <slot name="footer" :isCollapsed="isCollapsed"></slot>
      </footer>
      <footer
        class="w-full px-2 py-4 border-t border-solid border-ink-200"
        :class="footerBrandClass"
        v-if="$scopedSlots.brand"
      >
        <slot name="brand" :isCollapsed="isCollapsed"></slot>
      </footer>
    </div>
    <!-- Overlay -->
    <div
      :class="{ 'fixed w-full h-screen bg-ink-400 opacity-50 left-0 top-0 z-20': isOpen }"
      @click="toggleClose()"
    ></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { containsElement } from '~/utils/ui'

@Component({
  components: {
    ZIcon
  }
})
export default class SidebarMenu extends Vue {
  @Prop({ default: 'lg:w-64' })
  width!: string

  @Prop({ default: false })
  collapsed!: boolean

  @Prop({ default: true })
  collapsible!: boolean

  @Prop({ default: 'lg:w-16' })
  widthCollapsed!: string

  @Prop({ default: 'left' })
  direction!: string

  @Prop({ default: '' })
  footerClass!: string

  @Prop({ default: '' })
  footerBrandClass!: string

  public isCollapsed = this.collapsed
  public isOpen = false
  public largeScreenSize = 1024

  /**
   * Mounted component hook
   *
   * @return {void}
   */
  mounted(): void {
    this.$root.$on('ui:show-sidebar-menu', () => {
      this.isCollapsed = false
      this.isOpen = true
      this.$emit('open')
    })

    this.$root.$on('ui:hide-sidebar-menu', () => {
      this.isCollapsed = true
      this.isOpen = false
      this.$emit('collapse')
    })

    this.$root.$on('ui:toggle-sidebar-menu', () => {
      this.isCollapsed = !this.isCollapsed
      this.isOpen = !this.isOpen
      this.$emit(this.isCollapsed ? 'collapse' : 'open')
    })

    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        if (window.innerWidth < this.largeScreenSize) {
          this.isOpen = false
          this.isCollapsed = false
          this.$emit('collapse', this.isCollapsed)
        }
      })
    })
  }

  /**
   * Before destroy component hook
   *
   * @return {void}
   */
  beforeDestroy(): void {
    this.$root.$off('ui:show-sidebar-menu')
    this.$root.$off('ui:hide-sidebar-menu')
    this.$root.$off('ui:toggle-sidebar-menu')
  }

  get directionClasses(): string {
    const directionStyle: Record<string, string> = {
      left: 'lg:left-0 -left-3/4',
      right: 'lg:right-0 -right-3/4'
    }
    const openDirections: Record<string, string> = {
      left: 'left-0',
      right: 'right-0'
    }
    if (this.isOpen) {
      return openDirections[this.direction]
    }
    return directionStyle[this.direction]
  }

  get borderClasses(): string {
    const borders: Record<string, string> = {
      left: 'border-r',
      right: 'border-l'
    }
    if (!this.isOpen) return borders[this.direction]
    return ''
  }

  get modalWidth(): string {
    if (this.isCollapsed && this.collapsible) return `w-9/12 ${this.widthCollapsed}`
    return `w-9/12 ${this.width}`
  }

  get hoverStyle(): string {
    const directionStyle: Record<string, string> = {
      left: '-right-3',
      right: '-left-3'
    }
    return directionStyle[this.direction]
  }

  get arrow(): string {
    if (
      (this.direction == 'left' && !this.isCollapsed) ||
      (this.direction == 'right' && this.isCollapsed)
    ) {
      return `chevron-left`
    }
    return `chevron-right`
  }

  public collapseSidebar(): void {
    this.isCollapsed = !this.isCollapsed
    this.$emit('collapse', this.isCollapsed)
  }

  public openModal(): void {
    this.isOpen = true
    this.$emit('open')
  }

  /**
   * Close the sidebar
   *
   * @param {Event} event
   *
   * @return {void}
   */
  public closeSidebar(event: Event): void {
    if (event && event.target) {
      const target = event.target as HTMLElement
      const toggleButton = document.getElementById('mobile-menu-toggle')
      if (!toggleButton) {
        this.toggleClose()
      } else if (!containsElement(toggleButton, target) && target.id !== 'mobile-menu-toggle') {
        this.toggleClose()
      }
    }
  }

  /**
   * toggle the ui state and emit close event
   *
   * @return {any}
   */
  public toggleClose() {
    this.isOpen = false
    this.$emit('close')
  }
}
</script>
