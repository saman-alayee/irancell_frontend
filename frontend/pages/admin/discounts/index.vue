<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl font-bold">مدیریت تخفیف</h1>
      <button class="btn-primary" @click="openForm()">+ افزودن تخفیف</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="discount in discounts" :key="discount._id" class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="font-black text-xl">{{ discount.code }}</span>
          <span :class="discount.isActive ? 'badge-green' : 'badge-gray'" class="text-xs px-2 py-1 rounded-full">
            {{ discount.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>
        <p class="text-2xl font-bold mb-2">
          {{ discount.type === 'percent' ? `${discount.value}%` : formatPrice(discount.value) }}
        </p>
        <p class="text-sm text-muted mb-1">انقضا: {{ new Date(discount.expiresAt).toLocaleDateString('fa-IR') }}</p>
        <p class="text-sm text-muted mb-4">استفاده: {{ discount.usedCount }}{{ discount.maxUses ? ` / ${discount.maxUses}` : '' }}</p>
        <div class="flex gap-2">
          <button class="btn-outline flex-1 py-2 text-sm" @click="openForm(discount)">ویرایش</button>
          <button class="text-red-600 py-2 px-3 text-sm" @click="remove(discount._id)">حذف</button>
        </div>
      </div>
    </div>

    <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />

    <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showForm = false">
      <div class="card p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editing ? 'ویرایش تخفیف' : 'افزودن تخفیف' }}</h2>
        <form class="space-y-4" @submit.prevent="save">
          <input v-model="form.code" placeholder="کد تخفیف" class="input-field" dir="ltr" required />
          <select v-model="form.type" class="input-field">
            <option value="percent">درصدی</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
          <input v-model.number="form.value" type="number" placeholder="مقدار" class="input-field" required />
          <input v-model.number="form.minOrderAmount" type="number" placeholder="حداقل مبلغ سفارش" class="input-field" />
          <input v-model.number="form.maxUses" type="number" placeholder="حداکثر استفاده (اختیاری)" class="input-field" />
          <input v-model="form.expiresAt" type="datetime-local" class="input-field" required />
          <label class="flex items-center gap-2">
            <input v-model="form.showTimer" type="checkbox" />
            <span>نمایش تایمر</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="form.isActive" type="checkbox" />
            <span>فعال</span>
          </label>
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

const { apiFetch, formatPrice } = useApi()

const discounts = ref<any[]>([])
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const showForm = ref(false)
const editing = ref<any>(null)
const form = reactive({
  code: '', type: 'percent', value: 0, minOrderAmount: 0,
  maxUses: null as number | null, expiresAt: '', showTimer: true, isActive: true,
})

const fetchDiscounts = async () => {
  const res = await apiFetch(`/admin/discounts?page=${page.value}&limit=12`)
  discounts.value = res.data
  pagination.value = res.pagination
}

const onPageChange = (p: number) => { page.value = p; fetchDiscounts() }

const openForm = (discount?: any) => {
  editing.value = discount || null
  if (discount) {
    Object.assign(form, {
      ...discount,
      expiresAt: new Date(discount.expiresAt).toISOString().slice(0, 16),
    })
  } else {
    Object.assign(form, {
      code: '', type: 'percent', value: 10, minOrderAmount: 0,
      maxUses: null, expiresAt: '', showTimer: true, isActive: true,
    })
  }
  showForm.value = true
}

const save = async () => {
  try {
    const payload = { ...form, expiresAt: new Date(form.expiresAt).toISOString() }
    if (editing.value) {
      await apiFetch(`/admin/discounts/${editing.value._id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await apiFetch('/admin/discounts', { method: 'POST', body: JSON.stringify(payload) })
    }
    showForm.value = false
    await fetchDiscounts()
  } catch (e: any) {
    alert(e.message)
  }
}

const remove = async (id: string) => {
  if (!confirm('آیا مطمئن هستید؟')) return
  await apiFetch(`/admin/discounts/${id}`, { method: 'DELETE' })
  await fetchDiscounts()
}

onMounted(fetchDiscounts)
</script>
