<template>
  <div>
    <section class="section-muted py-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-3xl font-black mb-2">قوانین و مقررات</h1>
        <p class="text-muted">آخرین به‌روزرسانی: {{ updateDate }}</p>
      </div>
    </section>

    <section class="py-12">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="space-y-8 text-body leading-relaxed">
          <div v-for="section in sections" :key="section.title" class="card p-6">
            <h2 class="text-lg font-bold text-heading mb-3">{{ section.title }}</h2>
            <ul class="space-y-2 text-sm">
              <li v-for="(item, i) in section.items" :key="i" class="flex gap-2">
                <span class="text-irancell-yellow font-bold flex-shrink-0">{{ i + 1 }}.</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const updateDate = '۱۴۰۴/۰۴/۱۲'

const sections = [
  {
    title: 'شرایط عمومی خرید',
    items: [
      'خرید شماره تلفن فقط یک‌بار امکان‌پذیر است و پس از فروش، شماره از سایت حذف می‌شود.',
      'قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده می‌باشد.',
      'پس از پرداخت موفق، سفارش شما ثبت و در حال پردازش قرار می‌گیرد.',
      'زمان تحویل سیم‌کارت حداکثر ۲۴ ساعت کاری پس از تأیید پرداخت است.',
    ],
  },
  {
    title: 'پرداخت و بازگشت وجه',
    items: [
      'پرداخت فقط از طریق درگاه امن زرین‌پال انجام می‌شود.',
      'در صورت عدم تحویل به موقع، امکان بازگشت وجه وجود دارد.',
      'بازگشت وجه حداکثر ۷۲ ساعت کاری طول می‌کشد.',
    ],
  },
  {
    title: 'حریم خصوصی',
    items: [
      'اطلاعات شخصی شما محرمانه بوده و به اشخاص ثالث فروخته نمی‌شود.',
      'شماره موبایل فقط برای پیگیری سفارش و اطلاع‌رسانی استفاده می‌شود.',
      'رمز عبور به‌صورت رمزنگاری‌شده ذخیره می‌گردد.',
    ],
  },
  {
    title: 'مسئولیت‌ها',
    items: [
      'خریدار موظف است اطلاعات صحیح وارد کند.',
      'فروشگاه مسئولیتی در قبال استفاده نادرست از شماره خریداری‌شده ندارد.',
      'در صورت بروز اختلاف، مرجع حل اختلاف مراجع قضایی تهران است.',
    ],
  },
]
</script>
