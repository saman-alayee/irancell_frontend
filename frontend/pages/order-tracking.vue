<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">پیگیری سفارش</h1>

    <div class="max-w-lg mx-auto">
      <div class="card p-6 mb-6">
        <div class="flex gap-2 mb-4">
          <button
            :class="tab === 'order' ? 'bg-irancell-yellow text-irancell-black' : 'tab-inactive'"
            class="flex-1 py-2 rounded-xl font-bold transition"
            @click="tab = 'order'"
          >
            شماره سفارش
          </button>
          <button
            :class="tab === 'mobile' ? 'bg-irancell-yellow text-irancell-black' : 'tab-inactive'"
            class="flex-1 py-2 rounded-xl font-bold transition"
            @click="tab = 'mobile'"
          >
            شماره موبایل
          </button>
        </div>

        <input
          v-if="tab === 'order'"
          v-model="query"
          placeholder="مثال: ORD-XXXX"
          class="input-field mb-4"
          dir="ltr"
        />
        <input
          v-else
          v-model="query"
          placeholder="09xxxxxxxxx"
          class="input-field mb-4"
          dir="ltr"
          maxlength="11"
        />

        <button class="btn-primary w-full" :disabled="loading" @click="track">
          {{ loading ? 'در حال جستجو...' : 'جستجو' }}
        </button>
      </div>

      <div v-if="orders.length" class="space-y-4">
        <div v-for="order in orders" :key="order._id" class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="font-bold" dir="ltr">{{ order.orderNumber }}</span>
            <span :class="statusColor[order.status]" class="text-xs px-2 py-1 rounded-full">{{ statusLabel[order.status] }}</span>
          </div>
          <div class="text-sm space-y-2 text-body">
            <p>{{ order.user.firstName }} {{ order.user.lastName }}</p>
            <p dir="ltr">{{ order.user.mobile }}</p>
            <p class="font-bold text-heading">{{ formatPrice(order.totalAmount) }}</p>
          </div>
          <div class="mt-4 pt-4 border-t dark:border-gray-700">
            <p v-for="item in order.items" :key="item._id" class="text-sm flex justify-between">
              <span>{{ item.title }}</span>
              <span>{{ formatPrice(item.totalPrice) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="searched && !orders.length" class="text-center py-8 text-muted">
        سفارشی یافت نشد
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { apiFetch, formatPrice, statusLabel, statusColor } = useApi()

const tab = ref<'order' | 'mobile'>('order')
const query = ref((route.query.order as string) || '')
const orders = ref<any[]>([])
const loading = ref(false)
const searched = ref(false)

const track = async () => {
  if (!query.value) return
  loading.value = true
  searched.value = true
  try {
    const param = tab.value === 'order' ? `orderNumber=${query.value}` : `mobile=${query.value}`
    const res = await apiFetch(`/orders/track?${param}`)
    orders.value = res.data
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (query.value) track()
})
</script>
