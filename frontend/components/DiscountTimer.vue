<template>
  <div v-if="discount && timeLeft" class="bg-gradient-to-l from-irancell-yellow to-yellow-300 py-3 px-4">
    <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-irancell-black font-bold">
        <span>🔥</span>
        <span>تخفیف {{ discount.type === 'percent' ? `${discount.value}%` : formatPrice(discount.value) }}</span>
        <span class="text-sm font-normal">کد: {{ discount.code }}</span>
      </div>
      <div class="flex items-center gap-2 font-mono text-irancell-black font-bold" dir="ltr">
        <span class="bg-black/10 px-2 py-1 rounded">{{ pad(timeLeft.h) }}</span>:
        <span class="bg-black/10 px-2 py-1 rounded">{{ pad(timeLeft.m) }}</span>:
        <span class="bg-black/10 px-2 py-1 rounded">{{ pad(timeLeft.s) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { apiFetch, formatPrice } = useApi()
const discount = ref<any>(null)
const timeLeft = ref<{ h: number; m: number; s: number } | null>(null)
let timer: ReturnType<typeof setInterval>

const pad = (n: number) => String(n).padStart(2, '0')

const updateTimer = () => {
  if (!discount.value?.expiresAt) return
  const diff = new Date(discount.value.expiresAt).getTime() - Date.now()
  if (diff <= 0) {
    timeLeft.value = null
    clearInterval(timer)
    return
  }
  timeLeft.value = {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

onMounted(async () => {
  try {
    const res = await apiFetch('/discounts/active')
    if (res.data) {
      discount.value = res.data
      updateTimer()
      timer = setInterval(updateTimer, 1000)
    }
  } catch {}
})

onUnmounted(() => clearInterval(timer))
</script>
