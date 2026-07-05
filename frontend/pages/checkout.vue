<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">ثبت اطلاعات</h1>

    <div class="max-w-lg mx-auto">
      <form class="card p-6 space-y-4" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-4">
          <FormField label="نام" hint="نام واقعی خریدار — برای صدور فاکتور" required>
            <input v-model="form.firstName" class="input-field" required />
          </FormField>
          <FormField label="نام خانوادگی" hint="نام خانوادگی واقعی خریدار" required>
            <input v-model="form.lastName" class="input-field" required />
          </FormField>
        </div>
        <FormField label="شماره موبایل" hint="شماره ۱۱ رقمی — برای پیگیری سفارش و اطلاع‌رسانی" required>
          <input v-model="form.mobile" type="tel" maxlength="11" class="input-field" dir="ltr" required placeholder="09xxxxxxxxx" />
        </FormField>
        <FormField label="ایمیل" hint="اختیاری — رسید خرید به این ایمیل ارسال می‌شود">
          <input v-model="form.email" type="email" class="input-field" dir="ltr" />
        </FormField>

        <label class="flex items-start gap-2 text-sm">
          <input v-model="acceptTerms" type="checkbox" class="mt-1" required />
          <span>
            <NuxtLink to="/terms" target="_blank" class="link-accent hover:underline">قوانین و مقررات</NuxtLink>
            را مطالعه کرده و می‌پذیرم
          </span>
        </label>

        <div class="bg-subtle rounded-xl p-4">
          <div class="flex justify-between font-bold text-lg">
            <span>مبلغ قابل پرداخت</span>
            <span>{{ formatPrice(cartStore.total) }}</span>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full py-4 text-lg" :disabled="loading || !acceptTerms">
          {{ loading ? 'در حال پردازش...' : 'پرداخت' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()
const { apiFetch, formatPrice } = useApi()

const form = reactive({ firstName: '', lastName: '', mobile: '', email: '' })
const acceptTerms = ref(false)
const loading = ref(false)

onMounted(() => {
  cartStore.loadFromStorage()
  userStore.loadFromStorage()
  if (cartStore.isEmpty) router.push('/cart')
  if (userStore.user) {
    form.firstName = userStore.user.firstName
    form.lastName = userStore.user.lastName
    form.mobile = userStore.user.mobile
    form.email = userStore.user.email || ''
  }
})

const submit = async () => {
  loading.value = true
  try {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        cartItems: cartStore.toApiItems(),
        discountCode: cartStore.discountCode || undefined,
      }),
    })
    const payRes = await apiFetch(`/orders/${res.data._id}/pay`, { method: 'POST' })
    cartStore.clear()
    window.location.href = payRes.data.paymentUrl
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>
