<script setup lang="ts">
import { computed, ref } from 'vue'
import { CLUSTERS } from '@agile/contracts'
import { matterApi } from '../services/apiClient'
import { useDeviceStore } from '../stores/devices'

const props = defineProps<{ nodeId: string; endpoint: number }>()
const devices = useDeviceStore()
const busy = ref(false)
const on = computed(() => Boolean(devices.attributes(props.nodeId, props.endpoint, CLUSTERS.OnOff).OnOff))

async function setPower(command: 'On' | 'Off') {
  busy.value = true
  try {
    await matterApi.sendCommand({ node_id: props.nodeId, endpoint: props.endpoint, cluster: 'OnOff', command, payload: {} })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <article class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
    <div class="flex items-start justify-between">
      <div><p class="text-xs uppercase tracking-[0.2em] text-slate-400">Endpoint {{ endpoint }}</p><h2 class="mt-1 text-lg font-semibold">Smart switch</h2></div>
      <span class="rounded-lg px-2 py-1 text-xs" :class="on ? 'bg-cyan-400/15 text-cyan-300' : 'bg-slate-700 text-slate-400'">{{ on ? 'ON' : 'OFF' }}</span>
    </div>
    <button class="mt-8 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-40" :disabled="busy" @click="setPower(on ? 'Off' : 'On')">
      Turn {{ on ? 'off' : 'on' }}
    </button>
  </article>
</template>
