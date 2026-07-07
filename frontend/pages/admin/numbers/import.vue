<template>
  <div>
    <h1 class="text-2xl font-bold mb-8">ورود گروهی شماره‌ها</h1>

    <div class="max-w-3xl">
      <div class="card p-6 mb-6">
        <label class="flex items-start gap-3 cursor-pointer mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <input v-model="useIrancell" type="checkbox" class="w-5 h-5 mt-0.5" />
          <div>
            <p class="font-bold text-sm">دریافت قیمت و موجودی از ایرانسل</p>
            <p class="text-xs text-muted mt-1">
              همه شماره‌های فایل Excel یک‌به‌یک با API ایرانسل چک می‌شوند — فقط ستون شماره کافی است
            </p>
          </div>
        </label>

        <p v-if="useIrancell && devMode" class="text-sm text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200">
          ⚠️ <strong>DEV_MODE فعال است</strong> — فقط ۴ شماره تستی «موجود» نشان داده می‌شوند!
          در <code>backend/.env</code> مقدار <code>IRANCELL_SHOP_DEV_MODE=false</code> بگذارید و backend را restart کنید.
        </p>

        <p v-else-if="useIrancell" class="text-xs text-orange-600 dark:text-orange-400 mb-4">
          ⏱ ۱۰۰ شماره حدود ۱–۲ دقیقه (روی سرور ایران). اگر بیش از ۳ دقیقه طول کشید، backend به API ایرانسل وصل نیست — لوکال بدون VPN کار نمی‌کند.
        </p>

        <NuxtLink to="/admin/settings/pricing" class="text-sm text-irancell-yellow hover:underline mb-4 inline-block">
          ⚙️ تنظیم مارک‌آپ قیمت
        </NuxtLink>

        <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onFileSelect" />
        <button class="btn-primary w-full py-4" :disabled="previewing || importing" @click="fileInput?.click()">
          {{ previewing ? `در حال جستجو... ${progressHint}` : '📤 انتخاب فایل Excel' }}
        </button>
        <p v-if="fileName" class="text-sm text-muted mt-2 text-center">{{ fileName }}</p>
      </div>

      <div v-if="preview" class="card p-6 mb-6">
        <h2 class="font-bold mb-2">نتیجه جستجو</h2>
        <p v-if="preview.irancellNote" class="text-xs text-muted mb-4">{{ preview.irancellNote }}</p>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div class="text-center p-3 stat-tile">
            <p class="text-xl font-bold">{{ preview.totalRows }}</p>
            <p class="text-xs text-muted">کل ردیف</p>
          </div>
          <div v-if="useIrancell" class="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p class="text-xl font-bold text-blue-600">{{ preview.irancellCheckedCount || 0 }}</p>
            <p class="text-xs text-muted">چک‌شده ایرانسل</p>
          </div>
          <div class="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <p class="text-xl font-bold text-green-600">{{ preview.importCount }}</p>
            <p class="text-xs text-muted">قابل ورود</p>
          </div>
          <div class="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
            <p class="text-xl font-bold text-orange-600">{{ preview.unavailableCount || 0 }}</p>
            <p class="text-xs text-muted">ناموجود ایرانسل</p>
          </div>
          <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
            <p class="text-xl font-bold text-yellow-600">{{ preview.duplicateCount }}</p>
            <p class="text-xs text-muted">تکراری</p>
          </div>
          <div class="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
            <p class="text-xl font-bold text-red-600">{{ preview.errorCount }}</p>
            <p class="text-xs text-muted">خطا</p>
          </div>
        </div>

        <div v-if="useIrancell && preview.checkedPreview?.length" class="mb-6">
          <div class="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <h3 class="font-bold">لیست کامل جستجو ({{ preview.checkedPreview.length }} شماره)</h3>
            <button type="button" class="text-sm btn-outline py-2 px-4" @click="downloadResults">
              📥 دانلود Excel/CSV
            </button>
          </div>
          <div class="overflow-x-auto max-h-96 overflow-y-auto border dark:border-gray-700 rounded-xl">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-subtle">
                <tr>
                  <th class="p-2 text-right">#</th>
                  <th class="p-2 text-right">شماره</th>
                  <th class="p-2 text-right">وضعیت</th>
                  <th class="p-2 text-right">قیمت نهایی</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in preview.checkedPreview"
                  :key="row.number"
                  class="border-t dark:border-gray-700"
                  :class="row.available ? '' : 'opacity-60'"
                >
                  <td class="p-2 text-muted">{{ idx + 1 }}</td>
                  <td class="p-2 font-mono" dir="ltr">{{ row.number }}</td>
                  <td class="p-2">
                    <span :class="row.available ? 'text-green-600' : 'text-orange-600'">
                      {{ row.available ? 'موجود' : 'ناموجود' }}
                    </span>
                  </td>
                  <td class="p-2">{{ row.available ? formatPrice(row.price) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else-if="preview.preview?.length" class="mb-6">
          <h3 class="font-bold mb-2">شماره‌های موجود (نمونه {{ preview.preview.length }} مورد)</h3>
          <div class="overflow-x-auto max-h-64 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-subtle">
                <tr>
                  <th class="p-2 text-right">شماره</th>
                  <th class="p-2 text-right">قیمت نهایی</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in preview.preview" :key="row.number" class="border-t dark:border-gray-700">
                  <td class="p-2" dir="ltr">{{ row.number }}</td>
                  <td class="p-2">{{ formatPrice(row.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="preview.unavailablePreview?.length" class="mb-6">
          <h3 class="font-bold mb-2 text-orange-600">ناموجود در ایرانسل (نمونه)</h3>
          <ul class="text-sm text-muted space-y-1 max-h-40 overflow-y-auto">
            <li v-for="u in preview.unavailablePreview" :key="u.number" dir="ltr">
              {{ u.number }}
              <span v-if="u.pattern" class="text-xs opacity-70"> (pattern: {{ u.pattern }})</span>
              <span v-if="u.error" class="text-xs text-red-500 block">{{ u.error }}</span>
            </li>
          </ul>
        </div>

        <button class="btn-primary w-full py-3" :disabled="!preview.importCount || importing" @click="doImport">
          {{ importing ? 'در حال ورود...' : `ورود ${preview.importCount} شماره موجود` }}
        </button>
      </div>

      <div v-if="importResult" class="card p-6 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <h2 class="font-bold text-green-700 dark:text-green-400 mb-2">✅ ورود انجام شد</h2>
        <p>{{ importResult.imported }} شماره وارد شد</p>
        <p v-if="importResult.irancellCheckedCount">از {{ importResult.irancellCheckedCount }} شماره چک‌شده، {{ importResult.availableOnIrancellCount }} مورد در ایرانسل موجود بود.</p>
        <p>{{ importResult.skipped }} مورد رد شد (تکراری / ناموجود / خطا)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiUpload, formatPrice, apiFetch, getApiBase } = useApi()
const toast = useToastStore()

const fileInput = ref<HTMLInputElement>()
const fileName = ref('')
const selectedFile = ref<File | null>(null)
const preview = ref<any>(null)
const importResult = ref<any>(null)
const importing = ref(false)
const previewing = ref(false)
const useIrancell = ref(true)
const devMode = ref(false)
const progressHint = ref('')

onMounted(async () => {
  try {
    const res = await apiFetch('/admin/settings/pricing')
    devMode.value = !!res.data.irancellDevMode
  } catch {
    try {
      const health = await $fetch<{ irancellDevMode?: boolean }>(`${getApiBase()}/health`)
      devMode.value = !!health.irancellDevMode
    } catch { /* ignore */ }
  }
})

const importQuery = () => (useIrancell.value ? '?source=irancell' : '')

const onFileSelect = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  fileName.value = file.name
  importResult.value = null
  previewing.value = true
  progressHint.value = 'لطفاً صبر کنید...'
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiUpload(`/admin/numbers/import/preview${importQuery()}`, formData)
    preview.value = res.data
  } catch (err: any) {
    toast.error(err.message || 'خطا در جستجو')
  } finally {
    previewing.value = false
    progressHint.value = ''
  }
}

const doImport = async () => {
  if (!selectedFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await apiUpload(`/admin/numbers/import${importQuery()}`, formData)
    importResult.value = res.data
    preview.value = null
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    importing.value = false
  }
}

const downloadResults = () => {
  const rows = preview.value?.checkedPreview as Array<{
    number: string
    available: boolean
    basePrice: number
    netPrice?: number
    finalPriceWithVat?: number
    price: number
    pool?: string
  }> | undefined
  if (!rows?.length) return

  const header = 'number,available,sale_price_toman,pool'
  const lines = rows.map((r) =>
    [
      r.number,
      r.available ? 'yes' : 'no',
      r.available ? r.price : '',
      r.pool || '',
    ].join(',')
  )
  const blob = new Blob(['\uFEFF' + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `irancell-check-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
