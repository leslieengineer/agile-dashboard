<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConnectionStore } from '../stores/connection'

const { connected } = storeToRefs(useConnectionStore())
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
    :class="connected ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'"
  >
    <span class="h-2 w-2 rounded-full" :class="connected ? 'bg-emerald-400' : 'bg-rose-400'" />
    {{ connected ? 'MQTT online' : 'MQTT offline' }}
  </span>
</template>
