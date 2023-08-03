import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

import ZPagination from '.'

export default {
  title: 'Pagination',
  component: ZPagination,
  excludeStories: /.*Data$/
}

export const BasicPages = () => ({
  components: { ZPagination },
  template: `
    <div class="container space-y-5">
      <z-pagination
        :totalPages="999"
        :totalVisible="5"
      ></z-pagination>
    </div>`
})

export const StartAtDiffernetNumber = () => ({
  components: { ZPagination },
  data() {
    return {
      currentPage: 5
    }
  },
  template: `
    <div class="container space-y-5">
      <z-pagination
        v-model="currentPage"
        :totalPages="12"
        :totalVisible="5"
      ></z-pagination>
      <div class="text-vanilla-400">
        Currently at {{ currentPage }}
      </div>
    </div>`
})

export const LargerWindowThanPages = () => ({
  components: { ZPagination },
  template: `
    <div class="container space-y-5">
      <z-pagination
        :totalPages="3"
        :totalVisible="8"
      ></z-pagination>
      <z-pagination
        :totalPages="1"
        :totalVisible="8"
      ></z-pagination>
    </div>`
})

export const SmallWindows = () => ({
  components: { ZPagination },
  template: `
    <div class="container space-y-5">
      <z-pagination
        :totalPages="12"
        :totalVisible="3"
      ></z-pagination>
      <z-pagination
        :totalPages="12"
        :totalVisible="2"
      ></z-pagination>
    </div>`
})

export const UpdateFromParent = () => ({
  components: { ZPagination },
  data() {
    return {
      currentPage: 5
    }
  },
  template: `
    <div class="container space-y-5 p-3">
      <z-pagination
        :page="currentPage"
        :totalPages="12"
        :totalVisible="5"
      ></z-pagination>
      <div class="flex gap-x-4 text-vanilla-400">
        <button class="py-1 px-2 border border-ink-100 rounded-md bg-ink-300 hover:bg-ink-200 focus:outline-none" @click="() => {if (this.currentPage > 1) this.currentPage -= 1}">Previous</button>  
        <button class="py-1 px-2 border border-ink-100 rounded-md bg-ink-300 hover:bg-ink-200 focus:outline-none" @click="() => {if (this.currentPage !== 12) this.currentPage += 1}">Next</button>
      </div>
    </div>`
})
