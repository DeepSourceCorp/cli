import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import Calendar from 'dayjs/plugin/calendar'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.extend(LocalizedFormat)
dayjs.extend(Calendar)

/**
 * @param  {string} time
 */
function fromNow(time: string): string {
  return dayjs(time).fromNow()
}

function parseISODate(dateString: string): Date {
  return dayjs(dateString).toDate()
}

/**
 * Format date to given format or return the locale format
 * @param  {Date} date
 * @param  {string} format
 * @returns string
 */
function formatDate(date: Date, format?: string): string {
  return format ? dayjs(date).format(format) : dayjs(date).format('ll')
}

/**
 * format 85 seconds to 1 min 25 seconds
 * @param  {number} duration
 * @returns string
 */
function formatSeconds(duration: number, shorten = false): string {
  const formatted = []
  const finished = dayjs.duration(duration, 'seconds')

  if (finished.hours()) {
    formatted.push(finished.hours())

    if (finished.hours() === 1) {
      formatted.push(shorten ? 'hr ' : 'hour ')
    } else {
      formatted.push(shorten ? 'hrs ' : 'hours ')
    }
  }

  if (finished.minutes()) {
    formatted.push(finished.minutes())

    if (finished.minutes() === 1) {
      formatted.push(shorten ? 'min ' : 'minute ')
    } else {
      formatted.push(shorten ? 'mins ' : 'minutes ')
    }
  }

  if (finished.seconds()) {
    formatted.push(finished.seconds())

    if (finished.seconds() === 1) {
      formatted.push(shorten ? 's ' : 'second ')
    } else {
      formatted.push(shorten ? 's ' : 'seconds ')
    }
  }
  return formatted.join(' ')
}

/**
 * Genereate last n days
 * @param  {number} numberOfDays
 * @returns Array
 */
function countDaysBackwards(numberOfDays: number): Array<Date> {
  let counter = numberOfDays
  let date = dayjs()
  const days = []
  while (counter !== 0) {
    days.push(date.toDate())
    date = dayjs(date).subtract(1, 'day')
    counter = counter - 1
  }
  return days
}

function getNextMonth(): Date {
  return dayjs().add(1, 'month').toDate()
}

function getNextYear(): Date {
  return dayjs().add(1, 'year').toDate()
}

function getHumanizedTimeFromNow(timestamp: string): string {
    /**
     * Return the time display from now in a better human readable form.
     */
    const diff = dayjs().diff(timestamp, 'hour')
    if (diff <= 12) {
      return fromNow(timestamp)
    }
    return dayjs(timestamp).calendar(undefined, {
      sameDay: '[Earlier today]',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'll'
    })
  }

export {
  getHumanizedTimeFromNow,
  fromNow,
  formatSeconds,
  countDaysBackwards,
  formatDate,
  parseISODate,
  getNextMonth,
  getNextYear
}
