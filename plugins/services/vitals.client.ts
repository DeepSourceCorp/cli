import { getLCP, getFID, getCLS, getFCP, getTTFB, Metric } from 'web-vitals'

enum MetricNames {
  CLS = 'Cumulative Layout Shift',
  FID = 'First Input Delay',
  LCP = 'Largest Contentful Paint',
  FCP = 'First Contentful Paint',
  TTFB = 'Time to First Byte'
}

function report(metric: Metric): void {
  const vitalsUrl = process.env.VITALS_ENDPOINT || '/analytics'
  const { name, value } = metric

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%c${MetricNames[name]} (${name}): ${value}`,
      'font-weight: bold; background-color: #e0005a ; color: #ffffff'
    )
  } else {
    const body = JSON.stringify({ [name]: value })
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, body)
    } else {
      fetch(vitalsUrl, { body, method: 'POST', keepalive: true })
    }
  }
}

function vitalsInit(): void {
  getCLS(report)
  getFID(report)
  getLCP(report)
  getFCP(report)
  getTTFB(report)
}

declare global {
  interface window {
    doNotTrack: string
  }
}

if (window.doNotTrack || navigator.doNotTrack) {
  // The browser supports Do Not Track!
  if (
    process.env.NODE_ENV === 'development' ||
    !(window.doNotTrack === '1' || navigator.doNotTrack === 'yes' || navigator.doNotTrack === '1')
  ) {
    // Always log in development mode
    vitalsInit()
  }
} else {
  vitalsInit()
}
