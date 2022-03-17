import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { Inject, Context } from '@nuxt/types/app'

dayjs.extend(utc)
dayjs.extend(timezone)

const today = dayjs().tz('Asia/Kolkata').date()

const imageMap: Record<number, string> = {
  18: require('~/assets/images/easter-egg/cn1.png'),
  19: require('~/assets/images/easter-egg/cn2.png'),
  20: require('~/assets/images/easter-egg/cn3.png'),
  21: require('~/assets/images/easter-egg/cn4.png'),
  22: require('~/assets/images/easter-egg/cn5.png'),
  23: require('~/assets/images/easter-egg/cn6.png'),
  24: require('~/assets/images/easter-egg/cn6.png'),
  25: require('~/assets/images/easter-egg/cn6.png')
}

function konsaAnda(): string | undefined {
  if (today in imageMap) {
    return imageMap[today]
  }
}

function getBubble(): string {
  if (today >= 23) {
    return `
      <div class="transition-opacity delay-1000 show-on-egg-hover" id="norris-speaks-once-more">
        <img src="${require('~/assets/images/easter-egg/another-bubble.gif')}">
      </div>
    `
  }

  return `
    <div class="transition-opacity delay-1000 show-on-egg-hover" id="norris-speaks">
      <img src="${require('~/assets/images/easter-egg/bubble.png')}">
    </div>
  `
}

function prepareNorrisPlaceholder() {
  const el = document.createElement('div')
  el.id = 'something-is-hatching'

  if (today >= 23) {
    el.classList.add('no-hover-effect')
  }

  el.innerHTML = `
    <div id="something-is-really-hatching" class="group">
      ${getBubble()}
      <div id="close-btn" class="h-2.5 w-2.5 right-1 top-0 absolute show-on-egg-hover">
        <img src="${require('~/assets/images/easter-egg/8bit-close.png')}">
      </div>
      <img id="norris" src="${konsaAnda()}">
    </div>
  `

  document.body.append(el)

  setTimeout(() => {
    el.classList.add('push-up')
  }, 2500)

  //   el.querySelector('#norris')?.addEventListener('click', () => {
  //     alert('Something is hatching')
  //   })

  el.querySelector('#close-btn')?.addEventListener('click', () => {
    localStorage.setItem('show-norris-easter-egg', String(today))
    el.remove()
  })
}

function showNorris() {
  if (document.body.querySelector('#something-is-hatching')) {
    return
  }

  if (konsaAnda() && localStorage.getItem('show-norris-easter-egg') !== String(today)) {
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
