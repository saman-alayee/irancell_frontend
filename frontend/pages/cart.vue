<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">سبد خرید</h1>

    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <div class="text-6xl mb-4">🛒</div>
      <p class="text-muted mb-6">سبد خرید شما خالی است</p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/numbers" class="btn-primary">مشاهده شماره‌ها</NuxtLink>
        <NuxtLink to="/products" class="btn-outline py-2 px-6">محصولات</NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto">
      <div class="card divide-default mb-6">
        <div v-for="item in cartStore.items" :key="item.id" class="p-4 flex items-center gap-4">
          <div class="w-12 h-12 bg-irancell-yellow/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {{ item.type === 'number' ? '📱' : '📦' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold truncate">{{ item.type === 'number' ? formatNumber(item.title) : item.title }}</p>
            <p class="text-sm text-muted">{{ formatPrice(item.price) }}</p>
          </div>
          <div v-if="item.type === 'product'" class="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">
            <button class="px-3 py-1 qty-btn" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">−</button>
            <span class="px-3 py-1 font-bold">{{ item.quantity }}</span>
            <button class="px-3 py-1 qty-btn" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <p class="font-bold whitespace-nowrap">{{ formatPrice(item.price * item.quantity) }}</p>
          <button class="text-red-500 hover:text-red-700 p-1" @click="cartStore.removeItem(item.id)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Discount -->
      <div class="card p-4 mb-6">
        <div class="flex gap-2">
          <input v-model="discountInput" placeholder="کد تخفیف" class="input-field flex-1" />
          <button class="btn-outline py-2 px-4" @click="applyDiscount">اعمال</button>
        </div>
        <p v-if="cartStore.discountCode" class="text-green-600 dark:text-green-400 text-sm mt-2">
          کد {{ cartStore.discountCode }} اعمال شد ({{ formatPrice(cartStore.discountAmount) }} تخفیف)
        </p>
      </div>

      <!-- Summary -->
      <div class="card p-6">
        <div class="space-y-3 mb-6">
          <div class="flex justify-between">
            <span class="text-muted">جمع کل</span>
            <span>{{ formatPrice(cartStore.subtotal) }}</span>
          </div>
          <div v-if="cartStore.discountAmount" class="flex justify-between text-green-600 dark:text-green-400">
            <span>تخفیف</span>
            <span>− {{ formatPrice(cartStore.discountAmount) }}</span>
          </div>
          <div class="flex justify-between text-xl font-bold border-t dark:border-gray-700 pt-3">
            <span>مبلغ قابل پرداخت</span>
            <span>{{ formatPrice(cartStore.total) }}</span>
          </div>
        </div>
        <NuxtLink to="/checkout" class="btn-primary w-full block text-center py-4 text-lg">
          ادامه و پرداخت
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const { formatPrice, formatNumber, apiFetch } = useApi()
const discountInput = ref('')

onMounted(() => cartStore.loadFromStorage())

const applyDiscount = async () => {
  if (!discountInput.value) return
  try {
    const res = await apiFetch('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code: discountInput.value, subtotal: cartStore.subtotal }),
    })
    cartStore.setDiscount(discountInput.value.toUpperCase(), res.data.amount)
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
