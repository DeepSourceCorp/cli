import Vue from 'vue'
import { NuxtAppOptions } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

// Example Usage

// mounted() {
//   this.$socket.$on(<event-name>, (data) => {
//     console.log(`got ${data} from websocket`)
//   })
// }
//
// Sending message
// this.$socketManager.send({ event: 'socket', data: 'Hello' })

class WebSocketManager {
  url: string
  emitter: Vue
  reconnectInterval: number
  ws: WebSocket

  constructor(url: string, emitter: Vue) {
    this.url = url
    this.emitter = emitter
    this.reconnectInterval = 1000
    this.ws = new WebSocket(this.url)
    this.connect()
  }

  connect() {
    this.reconnectInterval = 1000
    this.ws = new WebSocket(this.url)

    this.ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data)
        this.emitter.$emit(data.event, data.data)
      } catch (err) {
        this.emitter.$emit('message', message)
      }
    }

    this.ws.onclose = (event) => {
      if (event) {
        // Event.code 1000 is our normal close event
        if (event.code !== 1000) {
          const maxReconnectInterval = 3000
          setTimeout(() => {
            if (this.reconnectInterval < maxReconnectInterval) {
              // Reconnect interval can't be > x seconds
              this.reconnectInterval += 1000
            }
            this.connect()
          }, this.reconnectInterval)
        }
      }
    }

    this.ws.onerror = (error): void => {
      console.error(error)
      this.ws.close()
    }
  }

  send(message: string | Record<string, unknown>) {
    return this.ready().then(() => {
      const parsedMessage = typeof message === 'string' ? message : JSON.stringify(message)
      return this.ws.send(parsedMessage)
    })
  }

  ready() {
    return new Promise<void>((resolve) => {
      if (this.ws.readyState !== this.ws.OPEN) {
        this.ws.onopen = () => {
          this.reconnectInterval = 1000
          resolve()
        }
      } else {
        resolve()
      }
    })
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $socket: Vue
    $socketManager: WebSocketManager
  }
}

export default ({ app }: { app: NuxtAppOptions }, inject: Inject): void => {
  const url =
    process.env.NODE_ENV === 'development' ? 'wss://echo.websocket.org/' : app.$config.webSocketUri

  const emitter = new Vue()
  const manager = new WebSocketManager(url, emitter)
  inject('socket', emitter)
  inject('socketManager', manager)
}
