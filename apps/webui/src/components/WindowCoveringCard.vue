<script setup lang="ts">
import { computed } from 'vue'
import { CLUSTERS } from '@agile/contracts'
import { matterMqtt } from '../services/mqttClient'
import { useDeviceStore } from '../stores/devices'

const props = defineProps<{ nodeId: string; endpoint: number }>()
const devices = useDeviceStore()
const position = computed(() => Number(devices.attributes(props.nodeId, props.endpoint, CLUSTERS.WindowCovering).CurrentPositionLiftPercent100ths ?? 0) / 100)
const send = (command: string) => matterMqtt.sendCommand({ node_id: props.nodeId, endpoint: props.endpoint, cluster: 'WindowCovering', command, payload: {} })
</script>

<template>
  <article class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Endpoint {{ endpoint }}</p>
    <div class="mt-1 flex items-end justify-between"><h2 class="text-lg font-semibold">Window covering</h2><strong class="text-2xl text-violet-300">{{ position }}%</strong></div>
    <div class="mt-8 grid grid-cols-3 gap-2">
      <button class="rounded-lg bg-violet-400 px-3 py-2 text-sm font-semibold text-slate-950" @click="send('UpOrOpen')">Open</button>
      <button class="rounded-lg bg-white/10 px-3 py-2 text-sm" @click="send('StopMotion')">Stop</button>
      <button class="rounded-lg bg-violet-400 px-3 py-2 text-sm font-semibold text-slate-950" @click="send('DownOrClose')">Close</button>
    </div>
  </article>
</template>
