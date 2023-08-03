<template>
  <div v-outside-click="closeSidebar" class="sidebar-menu">
    <!-- Sidebar modal -->
    <div
      class="transition-width sidebar-menu group absolute top-0 z-30 flex h-screen cursor-pointer flex-col border-slate-400 bg-ink-400 text-vanilla-100 duration-200"
      :class="[modalWidth, directionClasses, borderClasses, isOpen && 'shadow-black']"
    >
      <!-- Hover Gradient border -->
      <div
        v-if="collapsible"
        class="absolute -right-px top-0 hidden h-full w-px bg-gradient-juniper lg:group-hover:block"
      ></div>
      <header v-if="$scopedSlots.header" class="relative w-full">
        <slot name="header" :is-collapsed="isCollapsed"></slot>
        <div
          v-if="collapsible"
          class="relative top-full hidden -translate-y-1/2 transform-gpu rounded-full bg-juniper p-1 lg:absolute lg:group-hover:block"
          :class="[hoverStyle]"
          @click.stop="collapseSidebar()"
        >
          <z-icon :icon="arrow" size="small" color="ink-400" box-width="16" />
        </div>
      </header>
      <div class="flex w-full justify-center px-2">
        <slot name="subHeader" :is-collapsed="isCollapsed"></slot>
      </div>
      <div
        class="sidebar-items w-full flex-1 px-2 pb-4 pt-2"
        :class="{
          'custom-y-scroll': !isCollapsed
        }"
      >
        <slot :is-collapsed="isCollapsed"></slot>
      </div>
      <footer
        v-if="$scopedSlots.footer"
        class="w-full border-t border-solid border-slate-400 p-3 backdrop-blur-xl bg-gradient-dark-dawn"
        :class="footerClass"
      >
        <slot name="footer" :is-collapsed="isCollapsed"></slot>
      </footer>
      <footer
        v-if="$scopedSlots.brand"
        class="w-full border-t border-solid border-slate-400 px-2 py-4"
        :class="footerBrandClass"
      >
        <slot name="brand" :is-collapsed="isCollapsed"></slot>
      </footer>
    </div>
    <!-- Overlay -->
    <div
      :class="{ 'fixed left-0 top-0 z-20 h-screen w-full bg-ink-400 opacity-50': isOpen }"
      @click="toggleClose()"
    ></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { containsElement } from '~/utils/ui'

@Component({})
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
