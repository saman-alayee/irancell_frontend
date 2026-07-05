<template>
  <div class="card p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-muted mb-1">{{ title }}</p>
        <p class="text-3xl font-bold">{{ value }}</p>
      </div>
      <div class="text-4xl">{{ icon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; value: string | number; icon: string }>()
</script>
