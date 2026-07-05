<template>
  <div class="flex items-center gap-0.5 font-mono" dir="ltr">
    <span
      v-for="(d, i) in digits"
      :key="i"
      class="w-7 h-7 flex items-center justify-center rounded text-xs font-bold"
      :class="highlightIndices.includes(i) ? 'bg-irancell-yellow text-irancell-black' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
    >{{ d }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ number: string; highlight?: string }>()

const digits = computed(() => props.number.replace(/\D/g, '').split(''))

const highlightIndices = computed(() => {
  if (!props.highlight) return []
  const indices: number[] = []
  const num = props.number.replace(/\D/g, '')
  let idx = 0
  while ((idx = num.indexOf(props.highlight, idx)) !== -1) {
    for (let j = 0; j < props.highlight.length; j++) indices.push(idx + j)
    idx++
  }
  return indices
})
</script>
