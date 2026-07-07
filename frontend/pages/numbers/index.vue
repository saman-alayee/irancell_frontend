<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-1">شماره‌های موجود</h1>
        <p class="text-muted text-sm">جستجو و خرید شماره‌های VIP ایرانسل</p>
      </div>
      <p v-if="pagination.total" class="text-sm text-muted">
        {{ pagination.total.toLocaleString('fa-IR') }} شماره موجود
      </p>
    </div>

    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          v-model="filters.search"
          placeholder="جستجوی شماره: 0900..."
          class="input-field lg:col-span-2"
          dir="ltr"
          maxlength="11"
          @keyup.enter="applyFilters"
        />
        <button class="btn-primary py-2" @click="applyFilters">جستجو</button>
        <button class="btn-outline py-2" @click="resetFilters">پاک کردن</button>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <input v-model.number="filters.minPrice" type="number" placeholder="حداقل قیمت (تومان)" class="input-field" />
        <input v-model.number="filters.maxPrice" type="number" placeholder="حداکثر قیمت (تومان)" class="input-field" />
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="card animate-pulse h-36 bg-placeholder" />
    </div>

    <div v-else-if="!numbers.length" class="text-center py-16">
      <div class="text-5xl mb-4">📱</div>
      <p class="text-muted mb-4">شماره‌ای با این فیلتر یافت نشد</p>
      <button class="btn-outline py-2 px-6" @click="resetFilters">نمایش همه شماره‌ها</button>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NuxtLink
          v-for="num in numbers"
          :key="num._id"
          :to="`/i/${num.number}`"
          class="card p-5 hover:shadow-lg hover:border-irancell-yellow border-2 border-transparent transition group"
        >
          <p class="text-xl font-black tracking-wider mb-3 group-hover:text-irancell-yellow transition" dir="ltr">
            {{ formatNumber(num.number) }}
          </p>
          <NumberDigits :number="num.number" class="mb-3" />
          <div class="flex items-end justify-between gap-2">
            <NumberPriceDisplay :price="num.price" size="sm" align="start" />
            <span class="badge-green text-xs px-2 py-1 rounded-full shrink-0">موجود</span>
          </div>
        </NuxtLink>
      </div>

      <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { apiFetch, formatPrice, formatNumber } = useApi()

const numbers = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const filters = reactive({ search: '', minPrice: '' as number | '', maxPrice: '' as number | '' })

const fetchNumbers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: '16',
      status: 'available',
    })
    if (filters.search) params.set('search', filters.search.replace(/\D/g, ''))
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    const res = await apiFetch(`/numbers/search?${params}`)
    numbers.value = res.data
    pagination.value = res.pagination
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  page.value = 1
  fetchNumbers()
}

const resetFilters = () => {
  filters.search = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  applyFilters()
}

const onPageChange = (p: number) => {
  page.value = p
  fetchNumbers()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchNumbers)
</script>
