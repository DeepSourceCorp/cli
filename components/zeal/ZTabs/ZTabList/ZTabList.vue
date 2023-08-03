<script>
import ZTabItem from '../ZTabItem'
import { toPascal } from '~/utils/zeal'

export default {
  name: 'ZTabList',
  computed: {
    getActiveIndex() {
      const $parent = this.$parent
      return $parent.activeIndex
    }
  },
  render(h) {
    const children = this.$slots.default?.map((child, index) => {
      const options = child.componentOptions
      if (options && toPascal(options.tag || '') === 'ZTabItem') {
        const props = {
          index,
          updateActiveIndex: () => {
            const $parent = this.$parent
            $parent.updateActiveIndex(index)
          },
          ...options.propsData
        }
        return h(
          ZTabItem,
          {
            ...child.data,
            props: {
              ...props
            }
          },
          options.children
        )
      }
      return child
    })

    return h('div', { class: 'z-tab-list space-x-5 overflow-auto flex flex-nowrap' }, children)
  }
}
</script>
