<template>
  <div class="divide-y dark:divide-gray-700">
    <div
      v-for="num in numbers"
      :key="num.number || num._id"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
    >
      <div class="min-w-0">
        <p class="font-black text-xl sm:text-2xl tracking-wide text-heading mb-1" dir="ltr">
          {{ displayNumber(num) }}
        </p>
        <NumberDigits :number="num.number" />
      </div>
      <div class="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
        <NumberPriceDisplay :price="num.price" size="sm" align="end" />
        <div class="flex gap-2">
          <button
            v-if="num.available !== false"
            type="button"
            class="btn-outline py-2 px-4 text-sm whitespace-nowrap"
            :disabled="adding === num.number"
            @click="addToCart(num)"
          >
            {{ adding === num.number ? '...' : '🛒 سبد' }}
          </button>
          <NuxtLink :to="`/i/${num.number}`" class="btn-primary py-2 px-5 text-sm whitespace-nowrap">
            مشاهده
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMsisdnDisplay } from '~/utils/numberSearch'

defineProps<{
  numbers: Array<{ _id?: string; number: string; price: number; available?: boolean; msisdnDisplay?: string }>
}>()

const { apiFetch } = useApi()
const cartStore = useCartStore()
const toast = useToastStore()
cartStore.loadFromStorage()

const adding = ref('')

const displayNumber = (num: { number: string; msisdnDisplay?: string }) =>
  num.msisdnDisplay || formatMsisdnDisplay(num.number)

const addToCart = async (num: { number: string; price: number }) => {
  if (adding.value) return
  adding.value = num.number
  try {
    const res = await apiFetch(`/numbers/check/${num.number}`)
    if (!res.data?.available) {
      toast.error('این شماره در ایرانسل موجود نیست')
      return
    }
    const price = res.data.price ?? num.price
    if (cartStore.addNumber(num.number, price)) {
      toast.success('به سبد خرید اضافه شد')
    } else {
      toast.warning('قبلاً در سبد خرید است')
    }
  } catch (e: any) {
    toast.error(e.message || 'خطا')
  } finally {
    adding.value = ''
  }
}
</script>
