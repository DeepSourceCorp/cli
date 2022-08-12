import {
  toTitleCase,
  toSentenceCase,
  shortenLargeNumber,
  formatUSD,
  formatIntl,
  makeSafeNumber,
  toWrappableString,
  stripTrailingSlash,
  escapeHtml,
  safeRenderBackticks
} from '~/utils/string'

describe('[[ Test toTitleCase ]]', () => {
  it('Accepts valid input', () => {
    expect(toTitleCase(`hello-world`)).toBe('Hello World')
    expect(toTitleCase(`hello-world-new_Story`)).toBe('Hello World New Story')
    expect(toTitleCase(`Hello World`)).toBe('Hello World')
  })
  it('Accepts invalid input', () => {
    expect(toTitleCase(``)).toBe('')

    // @ts-ignore
    expect(toTitleCase(null)).toBe('')

    // @ts-ignore
    expect(toTitleCase(undefined)).toBe('')
  })
})

describe('[[ Test toSentenceCase ]]', () => {
  it('Accepts valid input', () => {
    expect(toSentenceCase(`hello-world`)).toBe('Hello world')
    expect(toSentenceCase(`hello-world-new_Story`)).toBe('Hello world new story')
    expect(toSentenceCase(`Hello World`)).toBe('Hello world')
  })
  it('Accepts invalid input', () => {
    expect(toSentenceCase(``)).toBe('')

    // @ts-ignore
    expect(toSentenceCase(null)).toBe('')

    // @ts-ignore
    expect(toSentenceCase(undefined)).toBe('')
  })
})

describe('[[ Test shortenLargeNumber ]]', () => {
  it('Accepts valid input', () => {
    expect(shortenLargeNumber(123212)).toBe('120k')
    expect(shortenLargeNumber(100)).toBe('100')
    expect(shortenLargeNumber(1000)).toBe('1k')
    expect(shortenLargeNumber(10000)).toBe('10k')
    expect(shortenLargeNumber(100000)).toBe('100k')
  })
  it('Accepts valid string input', () => {
    expect(shortenLargeNumber(`123212`)).toBe('120k')
    expect(shortenLargeNumber(`100`)).toBe('100')
    expect(shortenLargeNumber(`1000`)).toBe('1k')
    expect(shortenLargeNumber(`10000`)).toBe('10k')
    expect(shortenLargeNumber(`100000`)).toBe('100k')
  })
  it('Accepts valid string input with percentage', () => {
    expect(shortenLargeNumber(`123%`)).toBe('123%')
  })
  it('Accepts invalid input', () => {
    expect(shortenLargeNumber(``)).toBe('0')

    // @ts-ignore
    expect(shortenLargeNumber(null)).toBe('0')

    // @ts-ignore
    expect(shortenLargeNumber(undefined)).toBe('0')
  })
})

describe('[[ Test formatUSD ]]', () => {
  it('Accepts valid input', () => {
    expect(formatUSD(123212)).toBe('$123,212.00')
    expect(formatUSD(0)).toBe('$0.00')
    expect(formatUSD(100)).toBe('$100.00')
    expect(formatUSD(1000)).toBe('$1,000.00')
    expect(formatUSD(10000)).toBe('$10,000.00')
    expect(formatUSD(100000)).toBe('$100,000.00')
  })
  it('Accepts valid floating numbers', () => {
    expect(formatUSD(123212.33333)).toBe('$123,212.33')
    expect(formatUSD(0.454545)).toBe('$0.45')
    expect(formatUSD(100.05)).toBe('$100.05')
  })
  it('Accepts valid negative numbers', () => {
    expect(formatUSD(-123212.33333)).toBe('-$123,212.33')
    expect(formatUSD(-1000000)).toBe('-$1,000,000.00')
  })
  it('Accepts invalid input', () => {
    // @ts-ignore
    expect(formatUSD('')).toBe('$0.00')
    // @ts-ignore
    expect(formatUSD(null)).toBe('$0.00')

    // @ts-ignore
    expect(formatUSD(undefined)).toBe('')
    // @ts-ignore
    expect(formatUSD()).toBe('')
  })
})

describe('[[ Test formatIntl ]]', () => {
  it('Accepts valid input', () => {
    expect(formatIntl(123212)).toBe('123,212')
    expect(formatIntl(100)).toBe('100')
    expect(formatIntl(1000)).toBe('1,000')
    expect(formatIntl(10000)).toBe('10,000')
    expect(formatIntl(100000)).toBe('100,000')
  })
  it('Accepts invalid input', () => {
    // @ts-ignore
    expect(formatIntl('')).toBe('0')
    // @ts-ignore
    expect(formatIntl(null)).toBe('0')

    // @ts-ignore
    expect(formatIntl(undefined)).toBe('')
    // @ts-ignore
    expect(formatIntl()).toBe('')
  })
})

describe('[[ Test makeSafeNumber ]]', () => {
  it('Accepts regular numbers input', () => {
    expect(makeSafeNumber(100)).toBe(100)
    expect(makeSafeNumber(100.3242)).toBe(100.3242)
    expect(makeSafeNumber(-100.3242)).toBe(-100.3242)
  })
  it('Accepts string input', () => {
    expect(makeSafeNumber('100')).toBe(100)
    expect(makeSafeNumber('100.3242')).toBe(100.3242)
    expect(makeSafeNumber('-100.3242')).toBe(-100.3242)
  })
  it('Accepts invalid input', () => {
    // @ts-ignore
    expect(makeSafeNumber()).toBe(0)
    expect(makeSafeNumber('')).toBe(0)
    expect(makeSafeNumber('NaN')).toBe(0)
    expect(makeSafeNumber(NaN)).toBe(0)
    // @ts-ignore
    expect(makeSafeNumber(null)).toBe(0)
    // @ts-ignore
    expect(makeSafeNumber(undefined)).toBe(0)
  })
  it('Accepts invalid input with default return value', () => {
    const returnVal = 100
    expect(makeSafeNumber('NaN', returnVal)).toBe(returnVal)
    expect(makeSafeNumber(NaN, returnVal)).toBe(returnVal)
    // @ts-ignore
    expect(makeSafeNumber(undefined, returnVal)).toBe(returnVal)

    // Number(null) === Number('') === 0
    // @ts-ignore
    expect(makeSafeNumber(null, returnVal)).toBe(0)
    expect(makeSafeNumber('', returnVal)).toBe(0)
  })
})

describe('[[ Test stripTrailingSlash ]]', () => {
  it('Accepts valid input', () => {
    expect(stripTrailingSlash('/hello/world////')).toBe('/hello/world///')
    expect(stripTrailingSlash('/hello/world/')).toBe('/hello/world')
    expect(stripTrailingSlash('/hello/world')).toBe('/hello/world')
  })
})

test('[[ Test safeRenderBackticks ]]', () => {
  expect(
    safeRenderBackticks('Hello world, this is ```if``` statement and `else` should ```he` ``` ```')
  ).toEqual(
    'Hello world, this is <code class="bifrost-inline-code">if</code> statement and <code class="bifrost-inline-code">else</code> should ``<code class="bifrost-inline-code">he</code> <code class="bifrost-inline-code"> </code>'
  )
})

describe('[[ Test escapeHtml ]]', () => {
  it('Accepts valid input', () => {
    expect(escapeHtml(`<hello-world class="new-world" data-index='good'></hello-world>`)).toBe(
      `&lt;hello-world class=&quot;new-world&quot; data-index=&#039;good&#039;&gt;&lt;/hello-world&gt;`
    )
  })
})

describe('[[ Test toWrappableString ]]', () => {
  it('Accepts valid input', () => {
    expect(toWrappableString(`Amet occaecat fugiat do id labore laborum ad.`)).toBe(
      `Amet occaecat fugiat do id labore laborum ad.`
    )
    expect(toWrappableString(`Amet occaecat "fugiat" do id labore laborum ad.`)).toBe(
      `Amet occaecat &quot;fugiat&quot; do id labore laborum ad.`
    )
  })
  it('Accepts valid input with custom length', () => {
    expect(toWrappableString(`test/utils/string.spec.ts`, 5)).toBe(
      `test<span>/utils</span><span>/string.spec.ts</span>`
    )
    expect(toWrappableString(`test/utils/string.spec.ts`, 100)).toBe(`test/utils/string.spec.ts`)
    expect(toWrappableString(`test/"utils"/string.spec.ts`, 5)).toBe(
      `test<span>/&quot;utils&quot;</span><span>/string.spec.ts</span>`
    )
  })
  it('Accepts valid input with custom length and separator', () => {
    expect(toWrappableString(`test-utils-string.spec.ts`, 5, '-')).toBe(
      `test<span>/utils</span><span>/string.spec.ts</span>`
    )
    expect(toWrappableString(`test-utils-string.spec.ts`, 100, '-')).toBe(
      `test-utils-string.spec.ts`
    )
    expect(toWrappableString(`test-"utils"-string.spec.ts`, 5, '-')).toBe(
      `test<span>/&quot;utils&quot;</span><span>/string.spec.ts</span>`
    )
  })
})
