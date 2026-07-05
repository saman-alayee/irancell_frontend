<template>
  <div class="max-w-md w-full mx-4">
    <div class="card p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-irancell-yellow rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl font-black text-irancell-black">I</span>
        </div>
        <h1 class="text-2xl font-bold">ورود به پنل مدیریت</h1>
      </div>

      <form class="space-y-4" @submit.prevent="login">
        <FormField label="ایمیل" hint="ایمیلی که هنگام ایجاد حساب مدیر ثبت شده" required>
          <input v-model="email" type="email" class="input-field" dir="ltr" required />
        </FormField>
        <FormField label="رمز عبور" hint="رمز عبور حساب مدیر — حداقل ۶ کاراکتر" required>
          <input v-model="password" type="password" class="input-field" dir="ltr" required />
        </FormField>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
          {{ loading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/admin')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
