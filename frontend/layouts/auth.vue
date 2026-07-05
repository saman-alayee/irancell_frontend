<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors relative">
    <button
      class="absolute top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-lg shadow-sm hover:shadow transition"
      :title="themeStore.dark ? 'حالت روشن' : 'حالت تاریک'"
      @click="themeStore.toggle()"
    >
      {{ themeStore.dark ? '☀️' : '🌙' }}
    </button>
    <slot />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

onMounted(() => {
  authStore.loadFromStorage()
  themeStore.init()
  if (authStore.isLoggedIn) {
    router.push('/admin')
  }
})
</script>