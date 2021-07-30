<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { AuthGetterTypes } from '~/store/account/auth'

@Component({
  middleware: [
    async function ({ store, route, redirect, error }) {
      if (route.name === 'invitation') {
        error({ statusCode: 404, message: 'This page is not real' })
      }

      const path: string = ['', 'invitation', route.params.code, 'confirmation'].join('/')

      if (!store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
        redirect(302, `/signup/?next=${path}`)
      } else if (route.name === 'invitation-code') {
        redirect(302, path)
      }
    }
  ]
})
export default class Invitation extends Vue {}
</script>
