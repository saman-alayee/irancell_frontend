<template>
  <NuxtLayout name="default">
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div class="text-center max-w-md">
        <p class="text-8xl font-black text-irancell-yellow mb-4">{{ statusCode }}</p>
        <h1 class="text-2xl font-bold mb-3">
          {{ statusCode === 404 ? 'صفحه یافت نشد' : 'خطایی رخ داده است' }}
        </h1>
        <p class="text-muted mb-8">
          {{ statusCode === 404
            ? 'آدرسی که وارد کردید وجود ندارد یا حذف شده است.'
            : (error?.message || 'لطفاً دوباره تلاش کنید.') }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <button class="btn-primary py-2 px-6" @click="goHome">بازگشت به خانه</button>
          <NuxtLink to="/check-number" class="btn-outline py-2 px-6">بررسی شماره</NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode || 404)

const goHome = () => clearError({ redirect: '/' })
</script>
