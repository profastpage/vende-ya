/**
 * VENDE YA — Socket.io client (singleton)
 * -----------------------------------------------------------------
 * The Caddy gateway in this sandbox requires the port be passed
 * via the `XTransformPort` query param, and the socket path MUST
 * be `/`. See examples/websocket/frontend.tsx.
 */
import { io, type Socket } from 'socket.io-client'

let _socket: Socket | null = null
const REALTIME_PORT = 3003

export function getSocket(): Socket {
  if (_socket && _socket.connected) return _socket
  if (_socket) {
    _socket.connect()
    return _socket
  }
  _socket = io(`/?XTransformPort=${REALTIME_PORT}`, {
    path: '/',
    // Polling first — more reliable through the Caddy gateway in this
    // sandbox. WebSocket upgrade is attempted automatically after the
    // initial polling handshake succeeds.
    transports: ['polling', 'websocket'],
    upgrade: true,
    rememberUpgrade: false,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
    reconnectionDelayMax: 4000,
    timeout: 15000,
    auth: {
      // In prod: Supabase JWT. In dev: anonymous.
      token: typeof window !== 'undefined' ? window.localStorage.getItem('vendeya:guestId') : null,
    },
  })
  return _socket
}

/** Convenience: tear down the socket (for tests / unmount). */
export function destroySocket() {
  if (_socket) {
    _socket.disconnect()
    _socket = null
  }
}
