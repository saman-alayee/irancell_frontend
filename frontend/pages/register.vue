<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <div class="card p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-irancell-yellow rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-xl font-black">I</span>
          </div>
          <h1 class="text-2xl font-bold">ثبت‌نام</h1>
          <p class="text-sm text-muted mt-2">
            {{ otpSent ? 'کد تأیید پیامک‌شده را وارد کنید' : 'حساب کاربری رایگان بسازید' }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="otpSent ? submit() : sendOtp()">
          <div class="grid grid-cols-2 gap-4">
            <FormField label="نام" hint="نام واقعی شما" required>
              <input v-model="form.firstName" class="input-field" required :disabled="loading" />
            </FormField>
            <FormField label="نام خانوادگی" hint="نام خانوادگی واقعی" required>
              <input v-model="form.lastName" class="input-field" required :disabled="loading" />
            </FormField>
          </div>
          <FormField label="شماره موبایل" hint="کد تأیید به این شماره ارسال می‌شود" required>
            <input
              v-model="form.mobile"
              type="tel"
              maxlength="11"
              class="input-field"
              dir="ltr"
              placeholder="09xxxxxxxxx"
              required
              :disabled="loading || sendingOtp"
              @input="onMobileInput"
            />
          </FormField>
          <FormField label="ایمیل" hint="اختیاری — برای دریافت رسید خرید">
            <input v-model="form.email" type="email" class="input-field" dir="ltr" :disabled="loading" />
          </FormField>
          <FormField label="رمز عبور" hint="حداقل ۶ کاراکتر — برای ورود بعدی" required>
            <input v-model="form.password" type="password" class="input-field" dir="ltr" minlength="6" required :disabled="loading" />
          </FormField>

          <div v-if="otpSent">
            <FormField label="کد تأیید پیامک" hint="کد ۴ رقمی ارسال‌شده به موبایل" required>
              <input
                v-model="form.code"
                type="text"
                inputmode="numeric"
                maxlength="4"
                class="input-field text-center text-2xl tracking-[0.5em] font-bold"
                dir="ltr"
                placeholder="----"
                required
                :disabled="loading"
              />
            </FormField>
            <div class="flex items-center justify-between text-sm mt-2">
              <button
                type="button"
                class="text-muted hover:text-heading disabled:opacity-50"
                :disabled="countdown > 0 || sendingOtp"
                @click="sendOtp"
              >
                {{ countdown > 0 ? `ارسال مجدد (${countdown}s)` : 'ارسال مجدد کد' }}
              </button>
              <span class="text-muted">اعتبار: ۵ دقیقه</span>
            </div>
          </div>

          <label class="flex items-start gap-2 text-sm">
            <input v-model="acceptTerms" type="checkbox" class="mt-1" required :disabled="loading" />
            <span>
              <NuxtLink to="/terms" class="link-accent hover:underline">قوانین و مقررات</NuxtLink>
              را مطالعه کرده و می‌پذیرم
            </span>
          </label>

          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <p v-if="successMsg" class="text-green-600 dark:text-green-400 text-sm">{{ successMsg }}</p>

          <button
            type="submit"
            class="btn-primary w-full py-3"
            :disabled="loading || sendingOtp || !acceptTerms"
          >
            {{
              loading ? 'در حال ثبت...'
              : sendingOtp ? 'در حال ارسال...'
              : otpSent ? 'تأیید و ثبت‌نام'
              : 'ارسال کد تأیید'
            }}
          </button>
        </form>

        <p class="text-center text-sm text-muted mt-6">
          قبلاً ثبت‌نام کردید؟
          <NuxtLink to="/login" class="link-accent hover:underline">ورود</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest-only' })

const userStore = useUserStore()
const router = useRouter()
const form = reactive({ firstName: '', lastName: '', mobile: '', email: '', password: '', code: '' })
const acceptTerms = ref(false)
const loading = ref(false)
const sendingOtp = ref(false)
const otpSent = ref(false)
const error = ref('')
const successMsg = ref('')
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval>

const onMobileInput = () => {
  form.mobile = form.mobile.replace(/\D/g, '').slice(0, 11)
  if (otpSent.value) {
    otpSent.value = false
    form.code = ''
    successMsg.value = ''
  }
}

const startCountdown = (seconds: number) => {
  countdown.value = seconds
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(countdownTimer)
  }, 1000)
}

const sendOtp = async () => {
  if (!form.mobile.match(/^09\d{9}$/)) {
    error.value = 'شماره موبایل نامعتبر است'
    return
  }
  sendingOtp.value = true
  error.value = ''
  successMsg.value = ''
  try {
    const res = await userStore.sendOtp(form.mobile, 'register')
    otpSent.value = true
    successMsg.value = res.message || 'کد تأیید ارسال شد'
    startCountdown(res.data?.resendAfter || 60)
  } catch (e: any) {
    error.value = e.message
  } finally {
    sendingOtp.value = false
  }
}

const submit = async () => {
  if (!form.code.match(/^\d{4}$/)) {
    error.value = 'کد تأیید ۴ رقمی را وارد کنید'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      mobile: form.mobile,
      email: form.email || undefined,
      password: form.password,
      code: form.code,
    })
    router.push('/')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onUnmounted(() => clearInterval(countdownTimer))
</script>
