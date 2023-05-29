<script lang="ts">
import Vue from 'vue'
import { Context } from '@nuxt/types'

export default Vue.extend({
  middleware: [
    function ({ redirect, route }: Context): void {
      if (!route.params.provider) {
        const queryParams = route.query
        redirect(302, '/installation/gh', queryParams)
      }
    }
  ]
})
</script>
