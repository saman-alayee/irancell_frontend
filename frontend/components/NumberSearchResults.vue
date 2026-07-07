<template>
  <div class="space-y-3">
    <NuxtLink
      v-for="num in numbers"
      :key="num.number || num._id"
      :to="`/i/${num.number}`"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover-row"
    >
      <div>
        <span class="font-black text-lg tracking-wider block mb-2" dir="ltr">{{ formatNumber(num.number) }}</span>
        <NumberDigits :number="num.number" />
      </div>
      <div class="flex items-center gap-3 sm:flex-col sm:items-end">
        <NumberPriceDisplay :price="num.price" size="sm" align="end" />
        <span class="badge-green text-xs px-2 py-1 rounded-full whitespace-nowrap">موجود</span>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  numbers: Array<{ _id?: string; number: string; price: number }>
}>()

const { formatNumber } = useApi()
</script>
