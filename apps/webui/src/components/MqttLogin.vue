<script setup lang="ts">
import { ref } from 'vue'
import type { MqttConnectionOptions } from '../services/mqttClient'

defineProps<{ connecting: boolean }>()
const emit = defineEmits<{ connect: [options: MqttConnectionOptions] }>()
const defaultUrl = `ws://${window.location.hostname || 'localhost'}:9001`
const url = ref(import.meta.env.VITE_MQTT_WS_URL ?? defaultUrl)
const username = ref(import.meta.env.VITE_MQTT_USERNAME ?? 'webui')
const password = ref(import.meta.env.VITE_MQTT_PASSWORD ?? '')

function withoutPrefix(value: string, prefix: string): string {
  const trimmed = value.trim()
  return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length).trim() : trimmed
}

function connect() {
  emit('connect', {
    url: withoutPrefix(url.value, 'URL='),
    username: withoutPrefix(username.value, 'USERNAME='),
    password: withoutPrefix(password.value, 'PASSWORD='),
  })
}
</script>

<template>
  <form class="mb-6 grid gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 md:grid-cols-[2fr_1fr_1fr_auto]" @submit.prevent="connect">
    <label class="grid gap-1 text-xs text-slate-400">
      MQTT WebSocket URL
      <input v-model="url" required class="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" autocomplete="url" />
    </label>
    <label class="grid gap-1 text-xs text-slate-400">
      Username
      <input v-model="username" class="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" autocomplete="username" />
    </label>
    <label class="grid gap-1 text-xs text-slate-400">
      Password
      <input v-model="password" type="password" class="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" autocomplete="current-password" />
    </label>
    <button class="self-end rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" type="submit" :disabled="connecting">{{ connecting ? 'Connecting…' : 'Connect' }}</button>
  </form>
</template>
