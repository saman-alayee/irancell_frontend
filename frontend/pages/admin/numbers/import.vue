<template>
  <div>
    <h1 class="text-2xl font-bold mb-8">ورود گروهی شماره‌ها</h1>

    <div class="max-w-2xl">
        <div class="card p-6 mb-6">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          فایل Excel با ستون‌های <code class="code-inline">number</code>،
          <code class="code-inline">price</code> و
          <code class="code-inline">status</code> (اختیاری) آپلود کنید.
        </p>

        <a
          href="/samples/numbers-sample.csv"
          download="numbers-sample.csv"
          class="flex items-center gap-3 p-4 mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
        >
          <span class="text-2xl">📥</span>
          <div>
            <p class="font-bold text-sm">دانلود فایل نمونه Excel</p>
            <p class="text-xs text-muted">numbers-sample.csv — شامل ۵ شماره نمونه</p>
          </div>
        </a>

        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="onFileSelect"
        />
        <button class="btn-primary w-full py-4" @click="fileInput?.click()">
          📤 انتخاب فایل Excel
        </button>
        <p v-if="fileName" class="text-sm text-muted mt-2 text-center">{{ fileName }}</p>
      </div>

      <div v-if="preview" class="card p-6 mb-6">
        <h2 class="font-bold mb-4">پیش‌نمایش</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="text-center p-3 stat-tile">
            <p class="text-2xl font-bold">{{ preview.totalRows }}</p>
            <p class="text-xs text-muted">کل ردیف‌ها</p>
          </div>
          <div class="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ preview.importCount }}</p>
            <p class="text-xs text-muted">قابل ورود</p>
          </div>
          <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
            <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ preview.duplicateCount }}</p>
            <p class="text-xs text-muted">تکراری</p>
          </div>
          <div class="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ preview.errorCount }}</p>
            <p class="text-xs text-muted">خطا</p>
          </div>
        </div>

        <div v-if="preview.errors?.length" class="mb-4">
          <h3 class="font-bold text-red-600 mb-2">خطاها:</h3>
          <ul class="text-sm space-y-1 max-h-40 overflow-y-auto">
            <li v-for="(err, i) in preview.errors.slice(0, 20)" :key="i" class="text-red-500">
              ردیف {{ err.row }}: {{ err.message }}
            </li>
          </ul>
        </div>

        <div v-if="preview.preview?.length" class="mb-6">
          <h3 class="font-bold mb-2">نمونه (۲۰ مورد اول):</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="bg-subtle"><th class="p-2 text-right">شماره</th><th class="p-2 text-right">قیمت</th><th class="p-2 text-right">وضعیت</th></tr></thead>
              <tbody>
                <tr v-for="row in preview.preview" :key="row.number" class="border-t dark:border-gray-700">
                  <td class="p-2" dir="ltr">{{ row.number }}</td>
                  <td class="p-2">{{ formatPrice(row.price) }}</td>
                  <td class="p-2">{{ row.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          class="btn-primary w-full py-3"
          :disabled="!preview.importCount || importing"
          @click="doImport"
        >
          {{ importing ? 'در حال ورود...' : `ورود ${preview.importCount} شماره` }}
        </button>
      </div>

      <div v-if="importResult" class="card p-6 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <h2 class="font-bold text-green-700 dark:text-green-400 mb-2">✅ ورود با موفقیت انجام شد</h2>
        <p>{{ importResult.imported }} شماره وارد شد، {{ importResult.skipped }} مورد رد شد.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiUpload, formatPrice } = useApi()

const fileInput = ref<HTMLInputElement>()
const fileName = ref('')
const selectedFile = ref<File | null>(null)
const preview = ref<any>(null)
const importResult = ref<any>(null)
const importing = ref(false)

const onFileSelect = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  fileName.value = file.name
  importResult.value = null

  const formData = new FormData()
  formData.append('file', file)
  const res = await apiUpload('/admin/numbers/import/preview', formData)
  preview.value = res.data
}

const doImport = async () => {
  if (!selectedFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await apiUpload('/admin/numbers/import', formData)
    importResult.value = res.data
    preview.value = null
  } catch (e: any) {
    alert(e.message)
  } finally {
    importing.value = false
  }
}
</script>
