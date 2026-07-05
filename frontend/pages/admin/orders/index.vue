<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold">مدیریت سفارش‌ها</h1>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <input v-model="filters.search" placeholder="جستجو (سفارش/موبایل/شماره)" class="input-field lg:col-span-2" dir="ltr" @keyup.enter="applyFilters" />
      <input v-model="filters.fromDate" type="date" class="input-field" title="از تاریخ" />
      <input v-model="filters.toDate" type="date" class="input-field" title="تا تاریخ" />
      <select v-model="filters.itemType" class="input-field">
        <option value="">همه محصولات</option>
        <option value="number">فقط شماره</option>
        <option value="product">فقط کالا</option>
      </select>
      <select v-model="filters.status" class="input-field">
        <option value="">همه وضعیت‌ها</option>
        <option value="pending">در انتظار</option>
        <option value="paid">پرداخت شده</option>
        <option value="completed">تکمیل شده</option>
        <option value="cancelled">لغو شده</option>
      </select>
      <button class="btn-primary py-2 sm:col-span-2 lg:col-span-1" @click="applyFilters">فیلتر</button>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="text-right p-3">#</th>
            <th class="text-right p-3">شماره سفارش</th>
            <th class="text-right p-3">مشتری</th>
            <th class="text-right p-3">شماره‌های خریداری‌شده</th>
            <th class="text-right p-3">محصولات</th>
            <th class="text-right p-3">مبلغ</th>
            <th class="text-right p-3">وضعیت</th>
            <th class="text-right p-3">تاریخ</th>
            <th class="text-right p-3">عملیات</th>
          </tr>
        </thead>
        <tbody class="divide-y dark:divide-gray-700">
          <tr v-for="(order, idx) in orders" :key="order._id">
            <td class="p-3 text-muted">{{ rowIndex(idx) }}</td>
            <td class="p-3 font-bold" dir="ltr">{{ order.orderNumber }}</td>
            <td class="p-3">
              <p>{{ order.user.firstName }} {{ order.user.lastName }}</p>
              <p class="text-muted" dir="ltr">{{ order.user.mobile }}</p>
            </td>
            <td class="p-3">
              <div v-for="item in numberItems(order)" :key="item._id" class="mb-1">
                <span class="font-bold" dir="ltr">{{ item.title }}</span>
              </div>
              <span v-if="!numberItems(order).length" class="text-gray-400">—</span>
            </td>
            <td class="p-3">
              <div v-for="item in productItems(order)" :key="item._id" class="text-xs mb-1">
                {{ item.title }} ×{{ item.quantity }}
              </div>
              <span v-if="!productItems(order).length" class="text-gray-400">—</span>
            </td>
            <td class="p-3 whitespace-nowrap">{{ formatPrice(order.totalAmount) }}</td>
            <td class="p-3">
              <span :class="statusColor[order.status]" class="text-xs px-2 py-1 rounded-full">{{ statusLabel[order.status] }}</span>
            </td>
            <td class="p-3 text-muted whitespace-nowrap">{{ new Date(order.createdAt).toLocaleDateString('fa-IR') }}</td>
            <td class="p-3">
              <select
                :value="order.status"
                class="text-sm border dark:border-gray-600 dark:bg-gray-700 rounded-lg px-2 py-1"
                @change="updateStatus(order._id, ($event.target as HTMLSelectElement).value)"
              >
                <option value="pending">در انتظار</option>
                <option value="paid">پرداخت شده</option>
                <option value="processing">در حال پردازش</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch, formatPrice, statusLabel, statusColor } = useApi()

const orders = ref<any[]>([])
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const filters = reactive({ search: '', fromDate: '', toDate: '', itemType: '', status: '' })

const rowIndex = (idx: number) => (page.value - 1) * 20 + idx + 1
const numberItems = (order: any) => order.items?.filter((i: any) => i.type === 'number') || []
const productItems = (order: any) => order.items?.filter((i: any) => i.type === 'product') || []

const fetchOrders = async () => {
  const params = new URLSearchParams({ page: String(page.value), limit: '20' })
  if (filters.search) params.set('search', filters.search)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  if (filters.itemType) params.set('itemType', filters.itemType)
  if (filters.status) params.set('status', filters.status)
  const res = await apiFetch(`/admin/orders?${params}`)
  orders.value = res.data
  pagination.value = res.pagination
}

const applyFilters = () => { page.value = 1; fetchOrders() }
const onPageChange = (p: number) => { page.value = p; fetchOrders() }

const updateStatus = async (id: string, status: string) => {
  await apiFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  await fetchOrders()
}

onMounted(fetchOrders)
</script>
