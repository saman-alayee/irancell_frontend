<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <AdminSidebar />
    <AppToast />
    <div class="lg:mr-64">
      <AdminTopbar />
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

onMounted(() => {
  authStore.loadFromStorage()
  useThemeStore().init()
})
</script>
