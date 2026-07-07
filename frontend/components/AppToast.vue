<template>
  <div
    class="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[min(100%,24rem)] px-4 flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="item in toastStore.items"
        :key="item.id"
        class="pointer-events-auto rounded-xl shadow-lg border px-4 py-3 flex items-start gap-3 text-sm"
        :class="typeClass[item.type]"
      >
        <span class="text-lg shrink-0 leading-none">{{ icon[item.type] }}</span>
        <p class="flex-1 leading-relaxed">{{ item.message }}</p>
        <button
          type="button"
          class="shrink-0 opacity-70 hover:opacity-100 text-lg leading-none"
          aria-label="بستن"
          @click="toastStore.remove(item.id)"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { ToastType } from '~/stores/toast'

const toastStore = useToastStore()

const typeClass: Record<ToastType, string> = {
  success: 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
  error: 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100',
  info: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-heading',
  warning: 'bg-yellow-50 dark:bg-yellow-900/90 border-yellow-200 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
}

const icon: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.75rem);
}
</style>
