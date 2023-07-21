<template>
  <svg v-tooltip="passwordGrade" :class="sizeClass" viewBox="0 0 48 48">
    <circle class="donut-hole" cx="20" cy="20" r="15" fill="none" />
    <circle
      class="text-ink-100"
      stroke="currentColor"
      cx="50%"
      cy="50%"
      r="15"
      fill="transparent"
      stroke-width="4"
    />
    <circle
      class="transition-all duration-300 ease-in"
      :class="{
        'text-juniper': passwordScore === 4,
        'text-honey': passwordScore === 3,
        'text-cherry': passwordScore < 3
      }"
      cx="50%"
      cy="50%"
      r="15"
      fill="transparent"
      stroke="currentColor"
      stroke-width="4"
      :stroke-dasharray="2 * Math.PI * 15"
      :stroke-dashoffset="strokeOffset"
    />
  </svg>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class PasswordStrength extends Vue {
  @Prop({ required: true })
  password: string

  @Prop({ default: 'base' })
  size: string

  get sizeClass(): string {
    if (this.size === 'small') return 'h-6 w-6'
    if (this.size === 'base') return 'h-8 w-8'
    if (this.size === 'large') return 'h-10 w-10'

    return 'h-8 w-8'
  }

  public hasLowerCaseAlphabets = new RegExp('(?=.*[a-z])')
  public hasUpperCaseAlphabets = new RegExp('(?=.*[A-Z])')
  public hasNumbers = new RegExp('(?=.*?[0-9]).{8,}')
  public hasSpecialChars = new RegExp('(?=.*?[!@#\$&*~])')

  get passwordScore(): number {
    if (!this.password) {
      return 0
    }

    let currentStrength = 0

    if (this.hasLowerCaseAlphabets.test(this.password)) {
      currentStrength += 0.5
    }

    if (this.hasUpperCaseAlphabets.test(this.password)) {
      currentStrength += 0.5
    }

    if (this.hasNumbers.test(this.password)) {
      currentStrength += 1
    }

    if (this.hasSpecialChars.test(this.password)) {
      currentStrength += 1
    }

    if (this.password.length >= 16) {
      currentStrength += 1
    }

    if (this.password.length >= 24) {
      currentStrength += 0.5
    }

    if (this.password.length >= 32) {
      currentStrength += 0.5
    }

    if (this.password.length >= 40) {
      currentStrength += 0.5
    }

    return currentStrength > 4 ? 4 : Math.ceil(currentStrength)
  }

  get passwordGrade() {
    switch (true) {
      case this.passwordScore === 4:
        return 'Nice work. This is an excellent secret'
      case this.passwordScore === 3 &&
        this.password.length >= 16 &&
        this.hasNumbers.test(this.password):
        return 'Try adding some special charcters'
      case this.passwordScore === 3 &&
        this.password.length >= 16 &&
        this.hasSpecialChars.test(this.password) &&
        !this.hasNumbers.test(this.password):
        return 'Try adding some numbers'
      case this.passwordScore === 3 && this.password.length <= 16:
        return 'Try a longer secret'
      default:
        return 'This secret is not very secure'
    }
  }

  get strokeOffset(): number {
    const circumference = 2 * Math.PI * 15
    const passwordPercent = (this.passwordScore * 100) / 4
    const percentOffset = 100 - passwordPercent
    return (percentOffset * circumference) / 100
  }
}
</script>
