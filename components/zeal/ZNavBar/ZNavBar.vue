<script>
import ZAccordionItem from '../ZAccordionItem'
import { toPascal } from '~/utils/zeal'

export default {
  name: 'ZNavBar',
  props: {
    maxWidth: {
      type: String
    },
    hideLinksOnScroll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: false,
      isScrolling: false,
      isUserOnTop: true,
      hideOnScroll: ''
    }
  },
  mounted() {
    document.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.handleScroll)
  },
  watch: {
    isScrolling() {
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false
      }, 1500)
    }
  },
  computed: {
    headerWrapperStyle() {
      return [
        this.isUserOnTop ? 'bg-transparent border-transparent' : 'bg-ink-300 border-gray-light',
        `header-wrapper fixed left-0 top-0 flex z-1000 justify-center w-full max-w-full border-b min-h-16 transition-DEFAULT duration-75 backdrop-blur bg-opacity-25 no-filter:bg-opacity-95`
      ]
    },
    mobHeaderStyle() {
      return `${this.isOpen ? 'right-0' : '-right-full'}
              overflow-y-scroll lg:-right-full w-full h-screen absolute flex flex-col transition-all duration-200 ease-in-out top-0 bg-ink-300 flex flex-col`
    },
    linkSlotStyle() {
      return `${this.hideOnScroll}
              second hidden lg:flex flex-1 items-center justify-center w-full transition-all duration-200 ease-in-out`
    },
    showMenuButton() {
      return this.$slots.links?.length > 0
    }
  },
  methods: {
    toggleModal() {
      this.isOpen = !this.isOpen
    },
    handleScroll() {
      this.isScrolling = true
      this.isUserOnTop = Boolean(!(window.scrollY > 50))
      this.hideOnScroll =
        window.scrollY > 50 && this.hideLinksOnScroll ? 'lg:opacity-0' : 'lg:opacity-1'
    },
    getComponent(parent, name, list = []) {
      parent?.forEach((child) => {
        if (
          child &&
          child?.componentOptions &&
          toPascal(child.componentOptions.tag || '') === name
        ) {
          list.push(child)
        } else if (child?.children) {
          this.getComponent(child.children, name, list)
        }
      })
      return list
    }
  },
  render(h) {
    const mWidth = (this.maxWidth && `max-w-${this.maxWidth}`) || '',
      headerStyle = `${mWidth}
        w-full flex items-center px-6 space-x-3`,
      header = (
        <nav class={headerStyle}>
          <div class="first flex flex-1 items-center">{this.$slots.brand}</div>
          <div class={this.linkSlotStyle}>{this.$slots.links}</div>
          <div class="third flex flex-1 items-center justify-end space-x-3">{this.$slots.cta}</div>
          {this.showMenuButton && (
            <div class="flex cursor-pointer lg:hidden" on-click={this.toggleModal}>
              <z-icon icon="menu" size="medium"></z-icon>
            </div>
          )}
        </nav>
      ),
      menuItems = this.$slots.links?.map((child) => {
        const options = child.componentOptions
        if (options && toPascal(options.tag || '') === 'ZMenu') {
          if (options.propsData?.collapseOnMobile) {
            const items = this.getComponent(options.children, 'ZMenuItem'),
              // Checks if Menu Items are collapsible in Mobile, if true then render an accordion
              // Else the Menu item remains the same
              accordionItems = h(
                'div',
                {
                  class: 'flex flex-col text-base text-vanilla-400 my-1',
                  on: {
                    click: () => this.toggleModal()
                  }
                },
                items
              )
            return h(ZAccordionItem, {
              ...options.data,
              props: {
                title: child.data.attrs.title,
                spanCustomHeight: child.data.attrs.spanCustomHeight,
                customMaxHeight: child.data.attrs.customMaxHeight,
                ...options.propsData
              },
              class: {
                'px-4 py-2 border-b border-ink-200 lg:border-0': true
              },
              scopedSlots: {
                default: () => accordionItems
              }
            })
          } else {
            // If the menu item is a List Item Component, it will be rendered as a separate component
            // from the Menu Component
            const listItems = this.getComponent(options.children, 'ZList')
            return h('div', listItems)
          }
        }
        return child
      }),
      mobileHeader = (
        // Mobile Header Section
        <div class={this.mobHeaderStyle}>
          <div
            class="flex cursor-pointer justify-end border-b border-ink-200 p-4"
            on-click={this.toggleModal}
          >
            <z-icon icon="x" size="medium" color="vanilla-100"></z-icon>
          </div>
          {menuItems}
          <div class="flex flex-col space-y-4 p-4">{this.$slots.cta}</div>
        </div>
      )
    return (
      // Entire Header Wrapper
      <div class={this.headerWrapperStyle}>
        {header}
        {mobileHeader}
      </div>
    )
  }
}
</script>

<style scoped>
/*
    The grays in zeal are either too bright or too dark, and do not go with a translucent
    background blur that we are using in this component. So, we create a custom border-b
    class with a very light gray color here. This class is not supposed to be used anywhere
    outside of this component.
  */
.border-gray-light {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
