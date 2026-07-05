export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return
  if (to.path === '/admin/login') return

  const authStore = useAuthStore()
  if (import.meta.client) authStore.loadFromStorage()
  if (authStore.isLoggedIn) return

  return navigateTo('/admin/login')
})
