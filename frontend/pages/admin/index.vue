<template>
  <div>
    <h1 class="text-2xl font-bold mb-8">داشبورد</h1>

    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card animate-pulse h-32 bg-placeholder" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="کل سفارش‌ها" :value="stats?.orderCount || 0" icon="🛒" />
        <StatCard title="سفارش پرداخت‌شده" :value="stats?.paidOrderCount || 0" icon="✅" />
        <StatCard title="درآمد کل" :value="formatPrice(stats?.totalRevenue || 0)" icon="💰" />
        <StatCard title="شماره موجود" :value="stats?.numberStats?.available || 0" icon="📱" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="سفارشات ۳۰ روز اخیر"
          :labels="orderChartLabels"
          :data="orderChartData"
          color="#FFCC00"
        />
        <DashboardChart
          title="درآمد ۳۰ روز اخیر (تومان)"
          :labels="revenueChartLabels"
          :data="revenueChartData"
          color="#1A1A1A"
        />
      </div>

      <div v-if="stats?.charts?.ordersByStatus?.length" class="mt-6 card p-6">
        <h3 class="font-bold mb-4">وضعیت سفارش‌ها</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="s in stats.charts.ordersByStatus" :key="s.status" class="stat-tile">
            <p class="text-2xl font-black">{{ s.count }}</p>
            <p class="text-sm text-muted">{{ statusLabel[s.status] || s.status }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch, formatPrice, statusLabel } = useApi()

const { data: stats, pending } = await useAsyncData('dashboard', async () => {
  try {
    const res = await apiFetch('/admin/dashboard')
    return res.data
  } catch {
    return null
  }
}, { default: () => null })

const orderChartLabels = computed(() => stats.value?.charts?.ordersByDay?.map((d: any) => d.date) || [])
const orderChartData = computed(() => stats.value?.charts?.ordersByDay?.map((d: any) => d.count) || [])
const revenueChartLabels = computed(() => stats.value?.charts?.revenueByDay?.map((d: any) => d.date) || [])
const revenueChartData = computed(() => stats.value?.charts?.revenueByDay?.map((d: any) => d.total) || [])
</script>
