import dayjs from 'dayjs'
import Vue from 'vue'

import { StatusToast } from '~/components/StatusPage/index'
import { ScheduledMaintainenceT } from '~/types/statuspageTypes'
import { spawn } from '~/utils/component'

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

function allowUpdateForUser(id: string) {
  if (localStorage.getItem(id)) {
    const today = dayjs()
    const toastDismissDate = dayjs(localStorage.getItem(id))
    if (today > toastDismissDate.add(15, 'day')) {
      localStorage.removeItem(id)
      return true
    } else {
      return false
    }
  }
  return true
}

export async function refetchStatus(): Promise<void> {
  const statuspageSummary = await fetch(STATUS_API_URL, {
    headers: {
      Accept: 'application/json'
    }
  })

  const data = await statuspageSummary.json()

  const scheduled_maintenances: ScheduledMaintainenceT[] = data.scheduled_maintenances

  if (scheduled_maintenances.length > 0) {
    scheduled_maintenances
      .filter((update) => allowUpdateForUser(update.id))
      .forEach((item) => {
        const {
          id,
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
              id,
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
