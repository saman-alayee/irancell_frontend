<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">تنظیمات قیمت‌گذاری ایرانسل</h1>
    <p class="text-muted text-sm mb-8">قیمت پایه از shop.irancell.ir خوانده می‌شود و مارک‌آپ شما روی آن اعمال می‌شود.</p>

    <div v-if="loading" class="text-muted">در حال بارگذاری...</div>

    <form v-else class="card p-6 max-w-lg space-y-5" @submit.prevent="save">
      <FormField label="نوع افزایش قیمت">
        <select v-model="form.markupType" class="input-field">
          <option value="percent">درصدی</option>
          <option value="fixed">مبلغ ثابت (تومان)</option>
        </select>
      </FormField>

      <FormField :label="form.markupType === 'percent' ? 'درصد افزایش' : 'مبلغ افزایش (تومان)'">
        <input v-model.number="form.markupValue" type="number" min="0" class="input-field" required />
      </FormField>

      <label class="flex items-center gap-3 cursor-pointer">
        <input v-model="form.irancellFetchEnabled" type="checkbox" class="w-4 h-4" />
        <span class="text-sm">استعلام خودکار از ایرانسل فعال باشد</span>
      </label>

      <div class="p-4 bg-subtle rounded-xl text-sm">
        <p class="font-bold mb-2">مثال محاسبه</p>
        <p v-if="form.markupType === 'percent'">
          قیمت ایرانسل ۱۰,۰۰۰,۰۰۰ + {{ form.markupValue }}٪ =
          {{ formatPrice(Math.round(10000000 * (1 + form.markupValue / 100))) }}
        </p>
        <p v-else>
          قیمت ایرانسل ۱۰,۰۰۰,۰۰۰ + {{ formatPrice(form.markupValue) }} =
          {{ formatPrice(10000000 + form.markupValue) }}
        </p>
      </div>

      <button type="submit" class="btn-primary w-full py-3" :disabled="saving">
        {{ saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
      </button>
    </form>

    <div class="card p-6 max-w-lg mt-8">
      <h2 class="font-bold mb-4">تست استعلام یک شماره</h2>
      <div class="flex gap-2">
        <input v-model="testNumber" class="input-field flex-1" dir="ltr" placeholder="09001071252" />
        <button type="button" class="btn-outline px-4" :disabled="testing" @click="runTest">
          {{ testing ? '...' : 'تست' }}
        </button>
      </div>
      <pre v-if="testResult" class="mt-4 text-xs bg-subtle p-4 rounded-xl overflow-x-auto" dir="ltr">{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch, formatPrice } = useApi()
const toast = useToastStore()

const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const testNumber = ref('09001071252')
const testResult = ref('')

const form = reactive({
  markupType: 'percent',
  markupValue: 15,
  irancellFetchEnabled: true,
})

onMounted(async () => {
  try {
    const res = await apiFetch('/admin/settings/pricing')
    Object.assign(form, {
      markupType: res.data.markupType,
      markupValue: res.data.markupValue,
      irancellFetchEnabled: res.data.irancellFetchEnabled,
    })
  } finally {
    loading.value = false
  }
})

const save = async () => {
  saving.value = true
  try {
    await apiFetch('/admin/settings/pricing', {
      method: 'PUT',
      body: JSON.stringify(form),
    })
    toast.success('ذخیره شد')
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

const runTest = async () => {
  testing.value = true
  testResult.value = ''
  try {
    const res = await apiFetch('/admin/numbers/irancell-lookup', {
      method: 'POST',
      body: JSON.stringify({ number: testNumber.value }),
    })
    testResult.value = JSON.stringify(res.data, null, 2)
  } catch (e: any) {
    testResult.value = e.message
  } finally {
    testing.value = false
  }
}
</script>
