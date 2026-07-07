<template>
  <div class="container mx-auto px-4 py-16 text-center">
    <div class="max-w-md mx-auto">
      <div class="text-6xl mb-6">✅</div>
      <h1 class="text-2xl font-bold text-green-600 mb-4">پرداخت موفق</h1>
      <p class="text-body mb-4">سفارش شما با موفقیت ثبت شد</p>

      <div v-if="orderNumber || refId" class="card p-5 mb-6 text-right space-y-3">
        <p v-if="orderNumber" class="text-sm">
          <span class="text-muted">شماره سفارش:</span>
          <span class="font-bold block mt-1" dir="ltr">{{ orderNumber }}</span>
        </p>
        <p v-if="refId" class="text-sm">
          <span class="text-muted">کد پیگیری:</span>
          <span class="font-bold block mt-1" dir="ltr">{{ refId }}</span>
        </p>
      </div>

      <p class="text-sm text-body leading-relaxed mb-8 bg-subtle rounded-xl p-4">
        با تشکر از خرید شما — به اطلاع می‌رساند همکاران ما حداکثر تا ۲۴ ساعت آینده جهت هماهنگی با شما تماس خواهند گرفت.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink :to="`/order-tracking?order=${orderNumber}`" class="btn-primary">پیگیری سفارش</NuxtLink>
        <NuxtLink to="/" class="btn-outline">بازگشت به صفحه اصلی</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orderNumber = route.query.order as string
const refId = route.query.ref as string
</script>
