<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">محصولات</h1>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          v-model="filters.search"
          placeholder="جستجوی محصول..."
          class="input-field lg:col-span-2"
          @keyup.enter="applyFilters"
        />
        <select v-model="filters.category" class="input-field">
          <option value="">همه دسته‌ها</option>
          <option value="modem">مودم</option>
          <option value="accessory">لوازم جانبی</option>
        </select>
        <button class="btn-primary py-2" @click="applyFilters">جستجو</button>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <input v-model.number="filters.minPrice" type="number" placeholder="حداقل قیمت" class="input-field" />
        <input v-model.number="filters.maxPrice" type="number" placeholder="حداکثر قیمت" class="input-field" />
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card animate-pulse h-64 bg-placeholder" />
    </div>

    <div v-else-if="!products.length" class="text-center py-16 text-muted">
      محصولی یافت نشد
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product._id"
          :to="`/product/${product.slug}`"
          class="card hover:shadow-lg transition group overflow-hidden relative"
        >
          <div v-if="product.discountEnabled && product.discountPercent" class="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {{ product.discountPercent }}% تخفیف
          </div>
          <div class="aspect-square bg-placeholder flex items-center justify-center overflow-hidden">
            <img v-if="product.images?.[0]" :src="resolveImageUrl(product.images[0])" :alt="product.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <span v-else class="text-6xl">{{ product.category === 'modem' ? '📡' : '📦' }}</span>
          </div>
          <div class="p-4">
            <h3 class="font-bold mb-2 group-hover:text-irancell-yellow transition">{{ product.title }}</h3>
            <ProductDiscount :product="product" />
            <p class="text-sm mt-2" :class="product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ product.stock > 0 ? 'موجود' : 'ناموجود' }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { apiFetch, resolveImageUrl } = useApi()

const products = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const filters = reactive({ search: '', category: '', minPrice: '' as number | '', maxPrice: '' as number | '' })

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '12' })
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    const res = await apiFetch(`/products?${params}`)
    products.value = res.data
    pagination.value = res.pagination
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  page.value = 1
  fetchProducts()
}

const onPageChange = (p: number) => {
  page.value = p
  fetchProducts()
}

onMounted(fetchProducts)
</script>
