export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()
  if (import.meta.client) userStore.loadFromStorage()

  if (userStore.isLoggedIn) {
    return navigateTo('/')
  }
})
