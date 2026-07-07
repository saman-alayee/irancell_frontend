<template>
  <section class="py-16 section-muted">
    <div class="container mx-auto px-4 max-w-3xl">
      <h2 class="text-2xl font-bold text-center mb-8">سوالات متداول</h2>
      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i" class="card">
          <button
            class="w-full p-5 text-right flex items-center justify-between gap-4 font-bold hover-row"
            @click="open = open === i ? null : i"
          >
            <span>{{ faq.q }}</span>
            <span class="text-irancell-yellow text-xl flex-shrink-0">{{ open === i ? '−' : '+' }}</span>
          </button>
          <div v-if="open === i" class="px-5 pb-5 text-sm text-body leading-relaxed border-t dark:border-gray-700 pt-4">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const open = ref<number | null>(0)

const faqs = [
  { q: 'چگونه شماره را خریداری کنم؟', a: 'از بخش «شماره‌های موجود» یا جستجو در صفحه اصلی، شماره دلخواه را انتخاب کنید، به سبد خرید اضافه کنید و پرداخت را انجام دهید.' },
  { q: 'آیا شماره‌ها اصل هستند؟', a: 'بله، تمامی شماره‌ها از طریق نمایندگی رسمی ایرانسل عرضه می‌شوند و دارای ضمانت اصالت هستند.' },
  { q: 'زمان تحویل چقدر است؟', a: 'پس از پرداخت موفق، سیم‌کارت حداکثر تا ۷ روز کاری آماده تحویل می‌شود.' },
  { q: 'آیا امکان بازگشت وجه وجود دارد؟', a: 'در صورت عدم تحویل به موقع یا مشکل در فعال‌سازی، بازگشت وجه طی ۷۲ ساعت انجام می‌شود.' },
  { q: 'چگونه سفارش را پیگیری کنم؟', a: 'از بخش «پیگیری سفارش» با شماره سفارش یا شماره موبایل خود وضعیت را مشاهده کنید.' },
  { q: 'آیا می‌توانم چند شماره بخرم؟', a: 'بله، می‌توانید چند شماره و محصول را همزمان در سبد خرید داشته باشید. هر شماره فقط یک‌بار قابل خرید است.' },
]
</script>
