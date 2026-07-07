<template>
  <div class="bg-gradient-to-b from-irancell-black to-gray-900 dark:to-gray-950 min-h-screen">
    <ClientOnly>
      <DiscountTimer />
    </ClientOnly>

    <div class="container mx-auto px-4 py-8 lg:py-16">
      <div v-if="pending" class="flex justify-center py-20">
        <div class="w-12 h-12 border-4 border-irancell-yellow border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="invalidNumber" class="text-center py-20">
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-2xl font-bold text-white mb-2">شماره نامعتبر است</h1>
        <NuxtLink to="/sim-search" class="btn-primary mt-6 inline-block">جستجوی شماره</NuxtLink>
      </div>

      <div v-else-if="!numberData?.available" class="text-center py-20">
        <div class="text-6xl mb-4">😔</div>
        <h1 class="text-2xl font-bold text-white mb-2">این شماره در ایرانسل موجود نیست</h1>
        <p class="text-gray-400 mb-6" dir="ltr">{{ formatNumber(number) }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/sim-search" class="btn-primary">جستجوی شماره مشابه</NuxtLink>
          <NuxtLink to="/" class="btn-outline border-white text-white">صفحه اصلی</NuxtLink>
        </div>
      </div>

      <div v-else-if="numberData" class="max-w-lg mx-auto">
        <div class="card overflow-hidden shadow-2xl">
          <div class="bg-irancell-yellow p-6 text-center">
            <p class="text-sm text-irancell-black/70 mb-2">شماره انتخابی شما</p>
            <h1 class="text-3xl lg:text-4xl font-black tracking-wider text-irancell-black" dir="ltr">
              {{ formatNumber(numberData.number) }}
            </h1>
            <div class="mt-3 flex justify-center">
              <NumberDigits :number="numberData.number" />
            </div>
          </div>

          <div class="p-6 lg:p-8">
            <div class="mb-8">
              <NumberPriceDisplay :price="numberData.price" size="lg" label="قیمت" />
            </div>

            <div class="space-y-3 mb-6">
              <div v-for="feature in features" :key="feature" class="flex items-center gap-2 text-sm">
                <span class="text-green-500">✓</span>
                <span>{{ feature }}</span>
              </div>
            </div>

            <button class="btn-primary w-full text-lg py-4" :disabled="addingToCart" @click="addToCart">
              {{ addingToCart ? 'در حال بررسی...' : '🛒 افزودن به سبد خرید' }}
            </button>

            <button class="btn-secondary w-full mt-3 py-4" :disabled="addingToCart" @click="buyNow">
              خرید فوری
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div v-for="badge in badges" :key="badge.label" class="text-center text-white/80">
            <div class="text-2xl mb-1">{{ badge.icon }}</div>
            <p class="text-xs">{{ badge.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toast = useToastStore()
cartStore.loadFromStorage()

const addingToCart = ref(false)

const { apiFetch, formatNumber } = useApi()

const number = route.params.number as string

const { data: numberData, pending } = await useAsyncData(
  `number-${number}`,
  async () => {
    try {
      const res = await apiFetch(`/numbers/${number}`)
      return res.data
    } catch {
      return null
    }
  },
  { default: () => null }
)

const invalidNumber = computed(() => !pending.value && !numberData.value)

const features = [
  'اپراتور ایرانسل',
  'صفر ( بدون سابقه سلب امتیاز )',
  'فعالسازی ۷ روز کاری',
  'ضمانت بازگشت وجه',
  'قابلیت تحویل حضوری و ارسال پستی',
]

const badges = [
  { icon: '🔒', label: 'پرداخت امن' },
  { icon: '⚡', label: 'تحویل فوری' },
  { icon: '✅', label: 'ضمانت اصالت' },
]

const addToCart = async () => {
  if (!numberData.value || addingToCart.value) return
  addingToCart.value = true
  try {
    const res = await apiFetch(`/numbers/check/${numberData.value.number}`)
    if (!res.data?.available) {
      toast.error('این شماره ناموجود است')
      return
    }
    const price = res.data.price ?? numberData.value.price
    const added = cartStore.addNumber(numberData.value.number, price)
    if (added) {
      toast.success('شماره به سبد خرید اضافه شد')
    } else {
      toast.warning('این شماره قبلاً در سبد خرید است')
    }
  } catch (e: any) {
    toast.error(e.message || 'خطا در بررسی شماره')
  } finally {
    addingToCart.value = false
  }
}

const buyNow = async () => {
  await addToCart()
  if (!cartStore.items.some(i => i.type === 'number' && i.number === numberData.value?.number)) return
  router.push('/cart')
}
</script>
