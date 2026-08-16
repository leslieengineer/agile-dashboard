<script setup lang="ts">
import { useActivityStore } from '../stores/activity'
const activity = useActivityStore()
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-black/20 p-5">
    <h2 class="font-semibold">Activity</h2>
    <p v-if="activity.items.length === 0" class="mt-4 text-sm text-slate-500">No Matter messages received.</p>
    <ul v-else class="mt-4 space-y-2 text-xs">
      <li v-for="(item, index) in activity.items" :key="index" class="flex justify-between rounded-lg bg-white/5 px-3 py-2">
        <span>{{ 'type' in item ? 'attribute event' : item.status }} · node {{ item.node_id }} · ep {{ item.endpoint }}</span>
        <span class="text-slate-500">cluster {{ item.cluster }}</span>
      </li>
    </ul>
  </section>
</template>
