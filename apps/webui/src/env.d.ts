/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MQTT_WS_URL?: string
  readonly VITE_MQTT_USERNAME?: string
  readonly VITE_MQTT_PASSWORD?: string
  readonly VITE_REQUEST_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
