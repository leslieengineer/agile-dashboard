<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CLUSTERS } from '@agile/contracts'
import { matterApi } from '../services/apiClient'
import { useDeviceStore } from '../stores/devices'

const props = defineProps<{ nodeId: string; endpoint: number }>()
const devices = useDeviceStore()
const reported = computed(() => Number(devices.attributes(props.nodeId, props.endpoint, CLUSTERS.LevelControl).CurrentLevel ?? 0))
const level = ref(reported.value)
watch(reported, (value) => (level.value = value))

async function send() {
  await matterApi.sendCommand({
    node_id: props.nodeId,
    endpoint: props.endpoint,
    cluster: 'LevelControl',
    command: 'MoveToLevelWithOnOff',
    payload: { level: level.value, transitionTime: 5 },
  })
}
</script>

<template>
  <article class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Endpoint {{ endpoint }}</p>
    <div class="mt-1 flex items-end justify-between"><h2 class="text-lg font-semibold">Light level</h2><strong class="text-2xl text-amber-300">{{ Math.round(level / 2.54) }}%</strong></div>
    <input v-model.number="level" class="mt-8 w-full accent-amber-300" type="range" min="0" max="254" @change="send" />
  </article>
</template>
