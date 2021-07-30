<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  middleware: ['auth', 'redirectToHome'],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class BifrostHome extends Vue {}
</script>
