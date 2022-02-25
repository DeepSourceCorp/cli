<template>
  <div
    id="card-input-container"
    class="ph-ignore-input ph-no-capture"
    :class="{
      'border-vanilla-200': cardInputFocus,
      'border-ink-100': !cardInputFocus
    }"
  ></div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { StripeCardElement } from '@stripe/stripe-js'

@Component({})
export default class StripeCardInput extends Vue {
  public cardInputFocus = false
  public cardElement: StripeCardElement

  mounted() {
    this.$nextTick(() => {
      this.createStripCardInput()
    })
  }

  createStripCardInput(): void {
    if (this.$stripe) {
      const elements = this.$stripe.elements()
      const card = elements.create('card', {
        iconStyle: 'solid',
        style: {
          base: {
            iconColor: '#373c49',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            fontSmoothing: 'antialiased'
          },
          invalid: {
            iconColor: '#D6435B',
            color: '#da5565'
          }
        }
      })
      card.mount('#card-input-container')
      card.on('focus', () => {
        this.$emit('focus')
        this.cardInputFocus = true
      })
      card.on('blur', () => {
        this.$emit('blur')
        this.cardInputFocus = false
      })

      card.on('change', (event) => this.$emit('change', event))
      this.cardElement = card
    }
  }
}
</script>
