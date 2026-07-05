<template>
  <div class="container mx-auto px-4 py-16 text-center">
    <div class="max-w-md mx-auto">
      <div class="text-6xl mb-6">❌</div>
      <h1 class="text-2xl font-bold text-red-600 mb-4">پرداخت ناموفق</h1>
      <p class="text-body mb-8">متأسفانه پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink to="/cart" class="btn-primary">بازگشت به سبد خرید</NuxtLink>
        <NuxtLink to="/" class="btn-outline">صفحه اصلی</NuxtLink>
      </div>
    </div>
  </div>
</template>
