<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="text-center max-w-md">
      <p class="text-8xl font-black text-yellow-400 mb-4">{{ statusCode }}</p>
      <h1 class="text-2xl font-bold mb-3">
        {{ statusCode === 404 ? 'صفحه یافت نشد' : 'خطایی رخ داده است' }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        {{ statusCode === 404
          ? 'آدرسی که وارد کردید وجود ندارد یا حذف شده است.'
          : (error?.message || 'لطفاً دوباره تلاش کنید.') }}
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl" @click="goHome">
          بازگشت به خانه
        </button>
        <a href="/check-number" class="border-2 border-yellow-400 text-yellow-600 font-bold py-2 px-6 rounded-xl">
          بررسی شماره
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const statusCode = computed(() => props.error?.statusCode || 404)
const goHome = () => {
  if (import.meta.client) {
    clearError({ redirect: '/' })
  } else {
    navigateTo('/')
  }
}
</script>
