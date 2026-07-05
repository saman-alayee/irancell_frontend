<template>
  <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 mt-6">
    <button
      class="px-3 py-2 rounded-lg text-sm font-bold border dark:border-gray-600 disabled:opacity-40"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >قبلی</button>

    <button
      v-for="p in visiblePages"
      :key="p"
      :class="p === page ? 'bg-irancell-yellow text-irancell-black' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'"
      class="w-10 h-10 rounded-lg font-bold text-sm"
      @click="emit('update:page', p)"
    >{{ p }}</button>

    <button
      class="px-3 py-2 rounded-lg text-sm font-bold border dark:border-gray-600 disabled:opacity-40"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >بعدی</button>

    <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">کل: {{ total }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ page: number; totalPages: number; total?: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.totalPages, props.page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>
