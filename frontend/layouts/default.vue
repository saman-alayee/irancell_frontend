<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <AppToast />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
onMounted(() => {
  cartStore.loadFromStorage()
  useThemeStore().init()
})
</script>
