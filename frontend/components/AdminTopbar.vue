<template>
  <header class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-20 px-4 lg:px-8 py-4 flex items-center justify-between transition-colors">
    <div class="flex items-center gap-4">
      <button class="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" @click="sidebarOpen = true">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 class="font-bold text-lg">{{ authStore.admin?.name || 'مدیر' }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-lg" :title="themeStore.dark ? 'حالت روشن' : 'حالت تاریک'" @click="themeStore.toggle()">
        {{ themeStore.dark ? '☀️' : '🌙' }}
      </button>
      <NuxtLink to="/" target="_blank" class="text-sm text-gray-500 dark:text-gray-400 hover:text-irancell-black dark:hover:text-white">مشاهده سایت</NuxtLink>
      <button class="btn-secondary text-sm py-2 px-4" @click="logout">خروج</button>
    </div>
    <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const sidebarOpen = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/admin/login')
}
</script>
