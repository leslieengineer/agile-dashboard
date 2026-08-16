<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import ActivityLog from './components/ActivityLog.vue'
import ConnectionBadge from './components/ConnectionBadge.vue'
import CooktopPanel from './components/CooktopPanel.vue'
import LevelSlider from './components/LevelSlider.vue'
import MqttLogin from './components/MqttLogin.vue'
import OnOffCard from './components/OnOffCard.vue'
import WindowCoveringCard from './components/WindowCoveringCard.vue'
import { matterMqtt, type MqttConnectionOptions } from './services/mqttClient'
import { useActivityStore } from './stores/activity'
import { useConnectionStore } from './stores/connection'
import { useDeviceStore } from './stores/devices'

const nodeId = '0x0000000000000001'
const connection = useConnectionStore()
const devices = useDeviceStore()
const activity = useActivityStore()
let removeMessageListener: (() => void) | undefined
let removeConnectionListener: (() => void) | undefined

function connectMqtt(options: MqttConnectionOptions) {
  connection.startConnecting()
  try {
    matterMqtt.connect(options)
  } catch (error) {
    connection.update(false, error instanceof Error ? error.message : 'Unable to start MQTT connection')
  }
}

onMounted(() => {
  removeMessageListener = matterMqtt.onMessage((message) => {
    devices.apply(message)
    activity.push(message)
  })
  removeConnectionListener = matterMqtt.onConnection((connected, error) => connection.update(connected, error))
  if (import.meta.env.VITE_MQTT_USERNAME && import.meta.env.VITE_MQTT_PASSWORD) matterMqtt.connect()
})

onBeforeUnmount(() => {
  removeMessageListener?.()
  removeConnectionListener?.()
  void matterMqtt.disconnect()
})
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl px-5 py-10">
    <header class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Matter over Thread</p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-white">Smart Home Gateway</h1>
        <p class="mt-2 text-sm text-slate-400">Node {{ nodeId }}</p>
      </div>
      <ConnectionBadge />
    </header>

    <p v-if="connection.error" class="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{{ connection.error }}</p>
    <MqttLogin v-if="!connection.connected" :connecting="connection.connecting" @connect="connectMqtt" />
    <section class="grid gap-5 md:grid-cols-2">
      <OnOffCard :node-id="nodeId" :endpoint="1" />
      <LevelSlider :node-id="nodeId" :endpoint="1" />
      <WindowCoveringCard :node-id="nodeId" :endpoint="2" />
      <CooktopPanel :node-id="nodeId" :endpoint="3" />
    </section>
    <div class="mt-5"><ActivityLog /></div>
  </main>
</template>
