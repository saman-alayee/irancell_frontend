<template>
  <div class="container mx-auto px-4 py-8 lg:py-12">
    <div class="max-w-lg mx-auto">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-irancell-yellow/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔍</div>
        <h1 class="text-2xl font-bold mb-2">بررسی موجود بودن شماره</h1>
        <p class="text-muted text-sm">شماره مورد نظر را وارد کنید تا وضعیت آن در فروشگاه مشخص شود</p>
      </div>

      <div class="card p-6 mb-6">
        <FormField label="شماره تلفن" hint="شماره ۱۱ رقمی — مثال: 09001071252" required>
          <NumberSearch v-model="query" placeholder="09xxxxxxxxx" @search="check" />
        </FormField>
        <button class="btn-primary w-full py-3 mt-4" :disabled="loading || query.length < 11" @click="check">
          {{ loading ? 'در حال بررسی...' : 'بررسی شماره' }}
        </button>
      </div>

      <!-- Result -->
      <div v-if="checked && !loading">
        <div v-if="result" class="card overflow-hidden">
          <div class="bg-gradient-to-l from-irancell-yellow to-yellow-300 p-5 text-center">
            <p class="text-sm text-irancell-black/70 mb-1">شماره</p>
            <p class="text-2xl font-black tracking-wider text-irancell-black" dir="ltr">{{ formatNumber(result.number) }}</p>
            <div class="mt-3 flex justify-center">
              <NumberDigits :number="result.number" />
            </div>
          </div>
          <div class="p-6 text-center">
            <div v-if="result.status === 'available'" class="space-y-4">
              <div class="text-5xl">✅</div>
              <h2 class="text-xl font-bold text-green-600 dark:text-green-400">موجود و قابل خرید</h2>
              <p class="text-2xl font-black text-heading">{{ formatPrice(result.price) }}</p>
              <NuxtLink :to="`/i/${result.number}`" class="btn-primary w-full block py-3">مشاهده و خرید</NuxtLink>
            </div>
            <div v-else-if="result.status === 'reserved'" class="space-y-3">
              <div class="text-5xl">⏳</div>
              <h2 class="text-xl font-bold text-yellow-600 dark:text-yellow-400">رزرو شده</h2>
              <p class="text-muted">این شماره موقتاً رزرو شده — بعداً دوباره بررسی کنید</p>
            </div>
            <div v-else class="space-y-3">
              <div class="text-5xl">🔴</div>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">فروخته شده</h2>
              <p class="text-muted">این شماره قبلاً فروخته شده و دیگر موجود نیست</p>
              <NuxtLink to="/numbers" class="btn-outline w-full block py-3">مشاهده شماره‌های موجود</NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="card p-8 text-center">
          <div class="text-5xl mb-4">❓</div>
          <h2 class="text-xl font-bold mb-2">در سیستم ثبت نشده</h2>
          <p class="text-muted mb-6">این شماره در فروشگاه ما موجود نیست</p>
          <div class="flex flex-wrap justify-center gap-3">
            <NuxtLink to="/numbers" class="btn-primary py-2 px-6">شماره‌های موجود</NuxtLink>
            <button class="btn-outline py-2 px-6" @click="reset">جستجوی دیگر</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { apiFetch, formatPrice, formatNumber } = useApi()

const query = ref('')
const loading = ref(false)
const checked = ref(false)
const result = ref<any>(null)

const check = async () => {
  if (query.value.length < 11) return
  loading.value = true
  checked.value = false
  result.value = null
  try {
    const res = await apiFetch(`/numbers/${query.value}`)
    result.value = res.data
  } catch {
    result.value = null
  } finally {
    checked.value = true
    loading.value = false
  }
}

const reset = () => {
  query.value = ''
  checked.value = false
  result.value = null
}
</script>
