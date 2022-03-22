import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { Inject, Context } from '@nuxt/types/app'

dayjs.extend(utc)
dayjs.extend(timezone)

const today = dayjs().tz('Asia/Kolkata').date()

const imageMap: Record<number, string> = {
  22: require('~/assets/images/easter-egg/cn6.png'),
  23: require('~/assets/images/easter-egg/cn6.png'),
  24: require('~/assets/images/easter-egg/cn6.png'),
  25: require('~/assets/images/easter-egg/cn6.png'),
  26: require('~/assets/images/easter-egg/cn6.png'),
  27: require('~/assets/images/easter-egg/cn6.png')
}

function konsaAnda(): string | undefined {
  if (today in imageMap) {
    return imageMap[today]
  }
}

function getBubble(): string {
  return `
      <div class="transition-opacity delay-1000 show-on-egg-hover" id="norris-speaks-once-more">
        <img src="${require('~/assets/images/easter-egg/another-bubble.gif')}">
      </div>
    `
}

function prepareNorrisPlaceholder() {
  const el = document.createElement('div')
  el.id = 'something-is-hatching'

  el.innerHTML = `
    <div id="something-is-really-hatching" class="group">
      ${getBubble()}
      <img id="norris" src="${konsaAnda()}">
    </div>
  `

  document.body.append(el)

  setTimeout(() => {
    el.classList.add('push-up')
  }, 2500)

  el.querySelector('#norris')?.addEventListener('click', () => {
    localStorage.setItem('show-norris-easter-egg', 'hide-forever')
    el.remove()
    window.open('https://www.youtube.com/watch?v=PSHM9Z7HIRQ', '_blank')
  })
}

function showNorris() {
  if (document.body.querySelector('#something-is-hatching')) {
    return
  }

  const norrisState = localStorage.getItem('show-norris-easter-egg')

  if (norrisState === 'hide-forever') {
    return
  }

  if (konsaAnda() && norrisState !== String(today)) {
    prepareNorrisPlaceholder()
  }
}

function hideNorris() {
  const norris = document.body.querySelector('#something-is-hatching')
  norris?.remove()
}

declare module 'vue/types/vue' {
  interface Vue {
    $norris: { show: () => void; hide: () => void }
  }
}

import Vue from 'vue'
import NorrisMixin from '~/mixins/norrisMixin'

Vue.mixin(NorrisMixin)

export default (_: Context, inject: Inject): void => {
  inject('norris', { show: showNorris, hide: hideNorris })
}
