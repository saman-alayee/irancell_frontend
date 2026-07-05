<template>
  <div v-if="active" class="space-y-1">
    <div class="flex items-center gap-2 flex-wrap">
      <span v-if="originalPrice" class="text-sm text-gray-400 line-through">{{ formatPrice(originalPrice) }}</span>
      <span class="text-lg font-black text-red-600 dark:text-red-400">{{ formatPrice(product.price) }}</span>
      <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ product.discountPercent }}%</span>
    </div>
    <div v-if="product.showDiscountTimer && timeLeft" class="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-mono" dir="ltr">
      <span>⏰</span>
      <span>{{ pad(timeLeft.h) }}:{{ pad(timeLeft.m) }}:{{ pad(timeLeft.s) }}</span>
    </div>
  </div>
  <span v-else class="font-bold text-lg">{{ formatPrice(product.price) }}</span>
</template>

<script setup lang="ts">
import { formatPrice } from '~/composables/useApi'

const props = defineProps<{ product: any }>()

const pad = (n: number) => String(n).padStart(2, '0')
const timeLeft = ref<{ h: number; m: number; s: number } | null>(null)
let timer: ReturnType<typeof setInterval>

const active = computed(() => {
  if (!props.product?.discountEnabled || !props.product?.discountPercent) return false
  if (props.product.discountExpiresAt && new Date(props.product.discountExpiresAt) < new Date()) return false
  return true
})

const originalPrice = computed(() => {
  if (!active.value) return 0
  const p = props.product.discountPercent
  return Math.round(props.product.price / (1 - p / 100))
})

const updateTimer = () => {
  if (!props.product?.discountExpiresAt) { timeLeft.value = null; return }
  const diff = new Date(props.product.discountExpiresAt).getTime() - Date.now()
  if (diff <= 0) { timeLeft.value = null; return }
  timeLeft.value = {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

onMounted(() => {
  if (props.product?.showDiscountTimer && props.product?.discountExpiresAt) {
    updateTimer()
    timer = setInterval(updateTimer, 1000)
  }
})
onUnmounted(() => clearInterval(timer))
</script>
