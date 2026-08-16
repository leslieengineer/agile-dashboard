<script setup lang="ts">
import { computed } from 'vue'
import { CLUSTERS, TEST_VENDOR_ID } from '@agile/contracts'
import { matterApi } from '../services/apiClient'
import { useDeviceStore } from '../stores/devices'

const props = defineProps<{ nodeId: string; endpoint: number }>()
const devices = useDeviceStore()
const attributes = computed(() => devices.attributes(props.nodeId, props.endpoint, CLUSTERS.VendorCooktop))
const zones = computed(() => (attributes.value.ZonePower as number[] | undefined) ?? [0, 0, 0, 0])
const locked = computed(() => Boolean(attributes.value.PanelLocked))
const send = (command: string, payload: Record<string, unknown>) => matterApi.sendCommand({ node_id: props.nodeId, endpoint: props.endpoint, cluster: 'VendorCooktop', command, payload: { vendor_id: TEST_VENDOR_ID, ...payload } })
</script>

<template>
  <article class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur md:col-span-2">
    <div class="flex items-center justify-between"><div><p class="text-xs uppercase tracking-[0.2em] text-slate-400">Vendor cluster · Endpoint {{ endpoint }}</p><h2 class="mt-1 text-lg font-semibold">Induction cooktop</h2></div><button class="rounded-lg bg-white/10 px-3 py-2 text-sm" @click="send('LockPanel', { locked: !locked })">{{ locked ? 'Unlock' : 'Lock' }}</button></div>
    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <label v-for="(_, zone) in zones" :key="zone" class="rounded-xl bg-black/20 p-3 text-center"><span class="text-xs text-slate-400">Zone {{ zone + 1 }}</span><input class="mt-3 w-full accent-rose-400" type="range" min="0" max="9" :value="zones[zone]" :disabled="locked" @change="send('SetZonePower', { zone, powerLevel: Number(($event.target as HTMLInputElement).value) })" /><strong class="block text-rose-300">{{ zones[zone] }}</strong></label>
    </div>
    <button class="mt-4 rounded-lg border border-rose-400/40 px-4 py-2 text-sm text-rose-300" @click="send('StopAll', {})">Stop all zones</button>
  </article>
</template>
