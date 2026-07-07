<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl font-bold">مدیریت شماره‌ها</h1>
      <button class="btn-primary" @click="showForm = true">+ افزودن شماره</button>
    </div>

    <!-- Search -->
    <div class="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
      <input v-model="search" placeholder="جستجوی شماره..." class="input-field flex-1" dir="ltr" @keyup.enter="applySearch" />
      <select v-model="statusFilter" class="input-field sm:w-40" @change="applySearch">
        <option value="">همه وضعیت‌ها</option>
        <option value="available">موجود</option>
        <option value="reserved">رزرو شده</option>
        <option value="sold">فروخته شده</option>
      </select>
      <button class="btn-secondary py-2 px-6" @click="applySearch">جستجو</button>
    </div>

    <!-- Table -->
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="text-right p-3">#</th>
            <th class="text-right p-3">شماره</th>
            <th class="text-right p-3">ارقام</th>
            <th class="text-right p-3">قیمت</th>
            <th class="text-right p-3">وضعیت</th>
            <th class="text-right p-3">عملیات</th>
          </tr>
        </thead>
        <tbody class="divide-y dark:divide-gray-700">
          <tr v-for="(num, idx) in numbers" :key="num._id">
            <td class="p-3 text-muted font-bold">{{ rowIndex(idx) }}</td>
            <td class="p-3 font-bold" dir="ltr">{{ num.number }}</td>
            <td class="p-3"><NumberDigits :number="num.number" /></td>
            <td class="p-3">{{ formatPrice(num.price) }}</td>
            <td class="p-3">
              <span :class="statusColor[num.status]" class="text-xs px-2 py-1 rounded-full">{{ statusLabel[num.status] }}</span>
            </td>
            <td class="p-3">
              <button class="text-blue-600 hover:underline ml-3" @click="editNumber(num)">ویرایش</button>
              <button class="text-red-600 hover:underline" @click="deleteNumber(num._id)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showForm = false">
      <div class="card p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editing ? 'ویرایش شماره' : 'افزودن شماره' }}</h2>
        <form class="space-y-4" @submit.prevent="saveNumber">
          <FormField label="شماره تلفن" hint="۱۱ رقم — باید با 09 شروع شود. مثال: 09001071252" required>
            <input v-model="form.number" class="input-field" dir="ltr" required placeholder="09xxxxxxxxx" />
          </FormField>
          <FormField label="قیمت (تومان)" hint="قیمت فروش شماره به تومان" required>
            <input v-model.number="form.price" type="number" class="input-field" required />
          </FormField>
          <FormField label="وضعیت" hint="موجود=قابل خرید | رزرو=موقت | فروخته=غیرفعال">
            <select v-model="form.status" class="input-field">
              <option value="available">موجود</option>
              <option value="reserved">رزرو شده</option>
              <option value="sold">فروخته شده</option>
            </select>
          </FormField>
          <FormField label="توضیحات" hint="توضیح اختیاری — در صفحه شماره نمایش داده می‌شود">
            <textarea v-model="form.description" class="input-field" rows="2" />
          </FormField>
          <div class="flex gap-3">
            <button type="submit" class="btn-primary flex-1">ذخیره</button>
            <button type="button" class="btn-outline flex-1" @click="showForm = false">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch, formatPrice, statusLabel, statusColor } = useApi()
const toast = useToastStore()

const numbers = ref<any[]>([])
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const search = ref('')
const statusFilter = ref('')
const showForm = ref(false)
const editing = ref<any>(null)
const form = reactive({ number: '', price: 0, status: 'available', description: '' })

const rowIndex = (idx: number) => (page.value - 1) * 20 + idx + 1

const fetchNumbers = async () => {
  const params = new URLSearchParams({ page: String(page.value), limit: '20' })
  if (search.value) params.set('search', search.value)
  if (statusFilter.value) params.set('status', statusFilter.value)
  const res = await apiFetch(`/admin/numbers?${params}`)
  numbers.value = res.data
  pagination.value = res.pagination
}

const applySearch = () => { page.value = 1; fetchNumbers() }

const onPageChange = (p: number) => {
  page.value = p
  fetchNumbers()
}

const editNumber = (num: any) => {
  editing.value = num
  form.number = num.number
  form.price = num.price
  form.status = num.status
  form.description = num.description || ''
  showForm.value = true
}

const saveNumber = async () => {
  try {
    if (editing.value) {
      await apiFetch(`/admin/numbers/${editing.value._id}`, { method: 'PUT', body: JSON.stringify(form) })
    } else {
      await apiFetch('/admin/numbers', { method: 'POST', body: JSON.stringify(form) })
    }
    showForm.value = false
    editing.value = null
    Object.assign(form, { number: '', price: 0, status: 'available', description: '' })
    await fetchNumbers()
  } catch (e: any) {
    toast.error(e.message)
  }
}

const deleteNumber = async (id: string) => {
  if (!confirm('آیا مطمئن هستید؟')) return
  await apiFetch(`/admin/numbers/${id}`, { method: 'DELETE' })
  await fetchNumbers()
}

onMounted(fetchNumbers)
</script>
