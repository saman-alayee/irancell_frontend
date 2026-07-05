<template>
  <div class="container mx-auto px-4 py-16 text-center">
    <div class="max-w-md mx-auto">
      <div class="text-6xl mb-6">✅</div>
      <h1 class="text-2xl font-bold text-green-600 mb-4">پرداخت موفق</h1>
      <p class="text-body mb-2">سفارش شما با موفقیت ثبت شد</p>
      <p v-if="orderNumber" class="font-bold text-lg mb-2">شماره سفارش: {{ orderNumber }}</p>
      <p v-if="refId" class="text-sm text-muted mb-8">کد پیگیری: {{ refId }}</p>
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
