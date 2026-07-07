<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold">سفارش‌های من</h1>
        <p v-if="userStore.user" class="text-sm text-muted mt-1">
          {{ userStore.user.firstName }} {{ userStore.user.lastName }}
          <span dir="ltr" class="inline-block mr-1">{{ userStore.user.mobile }}</span>
        </p>
      </div>
      <NuxtLink to="/order-tracking" class="text-sm link-accent hover:underline">
        پیگیری با شماره سفارش
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted">در حال بارگذاری...</div>

    <div v-else-if="orders.length" class="space-y-4 max-w-2xl mx-auto">
      <div v-for="order in orders" :key="order._id" class="card p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <p class="font-bold text-lg" dir="ltr">{{ order.orderNumber }}</p>
            <p class="text-xs text-muted mt-1">{{ formatDate(order.createdAt) }}</p>
          </div>
          <span :class="statusColor[order.status]" class="text-xs px-2.5 py-1 rounded-full shrink-0">
            {{ statusLabel[order.status] }}
          </span>
        </div>

        <div class="bg-subtle rounded-xl p-4 mb-4">
          <p class="text-xs text-muted mb-1">نام خانوادگی خریدار سیم‌کارت</p>
          <p class="font-bold text-lg">{{ order.user.lastName }}</p>
          <p class="text-sm text-body mt-1">{{ order.user.firstName }}</p>
          <p class="text-sm text-muted mt-2" dir="ltr">{{ order.user.mobile }}</p>
        </div>

        <div class="space-y-2 mb-4">
          <p v-for="item in order.items" :key="item._id" class="text-sm flex justify-between gap-2">
            <span :dir="item.type === 'number' ? 'ltr' : undefined">{{ item.type === 'number' ? formatNumber(item.title) : item.title }}</span>
            <span class="font-medium shrink-0">{{ formatPrice(item.totalPrice) }}</span>
          </p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <span class="text-sm text-muted">مبلغ کل</span>
          <span class="font-bold text-lg">{{ formatPrice(order.totalAmount) }}</span>
        </div>
      </div>

      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 pt-4">
        <button
          class="btn-outline px-4 py-2 text-sm"
          :disabled="pagination.page <= 1 || loadingMore"
          @click="loadPage(pagination.page - 1)"
        >
          قبلی
        </button>
        <span class="py-2 text-sm text-muted">{{ pagination.page }} / {{ pagination.pages }}</span>
        <button
          class="btn-outline px-4 py-2 text-sm"
          :disabled="pagination.page >= pagination.pages || loadingMore"
          @click="loadPage(pagination.page + 1)"
        >
          بعدی
        </button>
      </div>
    </div>

    <div v-else class="text-center py-16 text-muted max-w-md mx-auto">
      <p class="text-lg mb-2">هنوز سفارشی ثبت نکرده‌اید</p>
      <NuxtLink to="/numbers" class="btn-primary inline-block mt-4 px-6 py-3">مشاهده شماره‌ها</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-user' })

const userStore = useUserStore()
const { apiFetch, formatPrice, formatNumber, statusLabel, statusColor } = useApi()

const orders = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const pagination = ref({ page: 1, pages: 1, total: 0, limit: 20 })

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

const loadPage = async (page = 1) => {
  if (page === 1) loading.value = true
  else loadingMore.value = true
  try {
    const res = await apiFetch(`/orders/mine?page=${page}`)
    orders.value = res.data
    pagination.value = res.pagination
  } catch {
    orders.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

onMounted(() => {
  userStore.loadFromStorage()
  loadPage()
})
</script>
