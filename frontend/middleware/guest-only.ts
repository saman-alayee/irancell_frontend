export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const userStore = useUserStore()
  if (import.meta.client) userStore.loadFromStorage()

  if (userStore.isLoggedIn) {
    return navigateTo('/')
  }
})
