<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl font-bold">مدیریت مدیران</h1>
      <button class="btn-primary" @click="openForm()">+ افزودن مدیر</button>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="text-right p-4">#</th>
            <th class="text-right p-4">نام</th>
            <th class="text-right p-4">ایمیل</th>
            <th class="text-right p-4">تاریخ ایجاد</th>
            <th class="text-right p-4">عملیات</th>
          </tr>
        </thead>
        <tbody class="divide-y dark:divide-gray-700">
          <tr v-for="(admin, idx) in admins" :key="admin._id">
            <td class="p-4 text-muted">{{ rowIndex(idx) }}</td>
            <td class="p-4 font-bold">
              {{ admin.name }}
              <span v-if="admin.isProtected" class="mr-2 text-xs badge-yellow px-2 py-0.5 rounded-full">مدیر اصلی</span>
            </td>
            <td class="p-4" dir="ltr">{{ admin.email }}</td>
            <td class="p-4 text-muted">{{ new Date(admin.createdAt).toLocaleDateString('fa-IR') }}</td>
            <td class="p-4">
              <button class="text-blue-600 hover:underline ml-3" @click="openForm(admin)">ویرایش</button>
              <button
                v-if="!admin.isProtected"
                class="text-red-600 hover:underline"
                @click="remove(admin._id)"
              >حذف</button>
              <span v-else class="text-muted text-xs">غیرقابل حذف</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="pagination.pages" :total="pagination.total" @update:page="onPageChange" />

    <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showForm = false">
      <div class="card p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editing ? 'ویرایش مدیر' : 'افزودن مدیر جدید' }}</h2>
        <form class="space-y-4" @submit.prevent="save">
          <FormField label="نام" hint="نام کامل مدیر برای نمایش در پنل" required>
            <input v-model="form.name" class="input-field" required />
          </FormField>
          <FormField label="ایمیل" hint="ایمیل ورود به پنل مدیریت — باید یکتا باشد" required>
            <input v-model="form.email" type="email" class="input-field" dir="ltr" required />
          </FormField>
          <FormField :label="editing ? 'رمز عبور جدید' : 'رمز عبور'" :hint="editing ? 'خالی بگذارید اگر نمی‌خواهید تغییر دهید' : 'حداقل ۶ کاراکتر'" :required="!editing">
            <input v-model="form.password" type="password" class="input-field" dir="ltr" :required="!editing" />
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

const { apiFetch } = useApi()
const admins = ref<any[]>([])
const page = ref(1)
const pagination = ref({ pages: 1, total: 0 })
const showForm = ref(false)
const editing = ref<any>(null)
const form = reactive({ name: '', email: '', password: '' })

const rowIndex = (idx: number) => (page.value - 1) * 15 + idx + 1

const fetchAdmins = async () => {
  const res = await apiFetch(`/admin/admins?page=${page.value}&limit=15`)
  admins.value = res.data
  pagination.value = res.pagination
}

const onPageChange = (p: number) => { page.value = p; fetchAdmins() }

const openForm = (admin?: any) => {
  editing.value = admin || null
  form.name = admin?.name || ''
  form.email = admin?.email || ''
  form.password = ''
  showForm.value = true
}

const save = async () => {
  try {
    const payload: any = { name: form.name, email: form.email }
    if (form.password) payload.password = form.password
    if (editing.value) {
      await apiFetch(`/admin/admins/${editing.value._id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(payload) })
    }
    showForm.value = false
    await fetchAdmins()
  } catch (e: any) { alert(e.message) }
}

const remove = async (id: string) => {
  if (!confirm('آیا مطمئن هستید؟')) return
  try {
    await apiFetch(`/admin/admins/${id}`, { method: 'DELETE' })
    await fetchAdmins()
  } catch (e: any) { alert(e.message) }
}

onMounted(fetchAdmins)
</script>
