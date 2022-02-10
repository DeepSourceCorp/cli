import dayjs from 'dayjs'
import {
  getHumanizedTimeFromNow,
  formatDate,
  formatSeconds,
  countDaysBackwards,
  parseISODate,
  getNextMonth,
  getNextYear,
  getDateDiffInDays,
  createDuration
} from '~/utils/date'

test('[[ getHumanizedTimeFromNow ]]', () => {
  const ghtfn = (date: Date) => {
    return getHumanizedTimeFromNow(String(date))
  }

  const today = new Date()
  expect(ghtfn(today)).toBe('a few seconds ago')

  today.setHours(today.getHours() - 1)
  expect(ghtfn(today)).toBe('an hour ago')

  today.setHours(today.getHours() - 2)
  expect(ghtfn(today)).toBe('3 hours ago')

  today.setHours(today.getHours() - 24)
  expect(ghtfn(today)).toBe('Yesterday')
})

describe('[[ formatDate ]]', () => {
  it('Default', () => {
    const dates = countDaysBackwards(1000)
    dates.forEach((date) => {
      expect(formatDate(date)).toBe(
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      )
    })
  })
  it('Custom format', () => {
    const dates = countDaysBackwards(1000)
    // Check L: MM/DD/YYYY
    dates.forEach((date) => {
      expect(formatDate(date, 'L')).toBe(
        date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
      )
    })
  })
})

describe('[[ formatSeconds ]]', () => {
  it('Full length', () => {
    expect(formatSeconds(1)).toBe('1 second ')
    expect(formatSeconds(85)).toBe('1 minute  25 seconds ')
    expect(formatSeconds(30)).toBe('30 seconds ')
    expect(formatSeconds(3000)).toBe('50 minutes ')
    expect(formatSeconds(4000)).toBe('1 hour  6 minutes  40 seconds ')
    expect(formatSeconds(30000)).toBe('8 hours  20 minutes ')
  })
  it('Shorten output', () => {
    expect(formatSeconds(1, true)).toBe('1 s ')
    expect(formatSeconds(85, true)).toBe('1 min  25 s ')
    expect(formatSeconds(30, true)).toBe('30 s ')
    expect(formatSeconds(3000, true)).toBe('50 mins ')
    expect(formatSeconds(4000, true)).toBe('1 hr  6 mins  40 s ')
    expect(formatSeconds(30000, true)).toBe('8 hrs  20 mins ')
  })
})

describe('[[ countDaysBackwards ]]', () => {
  it('Generates correct number of days', () => {
    const lastFiveDays = countDaysBackwards(5)
    expect(lastFiveDays.length).toBe(5)

    const zeroDays = countDaysBackwards(0)
    expect(zeroDays.length).toBe(0)
  })
  it('Generates correct intervals', () => {
    const testArray = countDaysBackwards(1000)
    for (let ii = 1; ii < testArray.length; ii++) {
      const curr = dayjs(testArray[ii])
      const prev = dayjs(testArray[ii - 1])
      expect(prev.diff(curr, 'days')).toBe(1)
    }
  })
})

test('[[ parseISODate ]]', () => {
  const today = new Date()
  expect(parseISODate(today.toISOString())).toMatchObject(today)
})

test('[[ getNextMonth ]]', () => {
  const thisMonth = new Date().getMonth()
  expect(getNextMonth().getMonth()).toBe(thisMonth + 1 > 12 ? 1 : thisMonth + 1)
})

test('[[ getNextYear ]]', () => {
  const thisYear = new Date().getFullYear()
  expect(getNextYear().getFullYear()).toBe(thisYear + 1)
})

test('[[ getDateDiffInDays ]]', () => {
  const today = new Date().toISOString()
  expect(getDateDiffInDays(today, dayjs().add(1, 'day').toISOString())).toBe(-1)
  expect(getDateDiffInDays(today, dayjs().add(5, 'day').toISOString())).toBe(-5)
  expect(getDateDiffInDays(today, dayjs().add(0, 'day').toISOString())).toBe(0)
})

test('[[ createDuration ]]', () => {
  expect(createDuration(30, 'days').months()).toBe(1)
  expect(createDuration(40, 'days').months()).toBe(1)
  expect(createDuration(60, 'days').months()).toBe(2)
  expect(createDuration(90, 'days').months()).toBe(3)
  expect(createDuration(120, 'days').months()).toBe(4)
})
