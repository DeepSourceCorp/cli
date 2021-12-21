import Vue from 'vue'
import { VueConstructor } from 'vue/types'

import { StatusToast } from '~/components/StatusPage/index'
import { ScheduledMaintainenceT, StatusToastPropsT } from '~/types/statuspageTypes'

// add the component w/ the specified props
export function spawn(
  id: string,
  propsData: StatusToastPropsT,
  Component: VueConstructor<Vue>,
  Vue: VueConstructor
) {
  const Instance = Vue.extend(Component)

  if (document) {
    return new Instance({
      el: document.getElementById(id)?.appendChild(document.createElement('div')),
      propsData
    })
  }
}

const containerClasses = [
  'z-1000',
  'fixed',
  'inset-0',
  'flex',
  'flex-col',
  'items-end',
  'justify-center',
  'px-4',
  'py-6',
  'pointer-events-none',
  'sm:p-6',
  'sm:items-end',
  'sm:justify-end'
]

const STATUS_API_URL = 'https://dwlkwbmqzv11.statuspage.io/api/v2/summary.json'

export async function refetchStatus(): Promise<void> {
  const statuspageSummary = await fetch(STATUS_API_URL, {
    headers: {
      Accept: 'application/json'
    }
  })

  const data = await statuspageSummary.json()

  const scheduled_maintenances: ScheduledMaintainenceT[] = data.scheduled_maintenances

  if (scheduled_maintenances.length > 0) {
    scheduled_maintenances.forEach((item) => {
      const {
        name: title,
        scheduled_for: scheduledFrom,
        scheduled_until: scheduledTill,
        shortlink: shortLink,
        components
      } = item
      const componentAffected = components.map((component) => component.name).join(', ')

      if (item.status === 'scheduled') {
        spawn(
          'status-toasts-wrapper',
          {
            title,
            scheduledFrom,
            scheduledTill,
            componentAffected,
            shortLink
          },
          StatusToast,
          Vue
        )
      }
    })
  } else {
    setTimeout(refetchStatus, 60 * 1000)
  }
}

export default function serviceStatus(): void {
  const toasts = document.createElement('div')
  containerClasses.forEach((c) => toasts.classList.add(c))
  toasts.setAttribute('id', 'status-toasts-wrapper')
  document.body.appendChild(toasts)

  setTimeout(refetchStatus, 60 * 1000)
}
