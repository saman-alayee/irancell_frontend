<template>
  <div>
    <section class="bg-gradient-to-b from-irancell-yellow/15 to-transparent dark:from-irancell-yellow/10 py-10 lg:py-14">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-black mb-3">شماره سیم‌کارت دلخواه خود را به راحتی پیدا کنید</h1>
          <p class="text-muted text-sm sm:text-base">حداقل ۳ رقم برای شروع جستجو وارد کنید</p>
        </div>

        <div class="card p-5 sm:p-6 shadow-lg">
          <NumberSimSearch
            ref="searchRef"
            :loading="loading"
            :initial-mode="initialMode"
            :initial-query="String(route.query.q || '')"
            :initial-prefix="String(route.query.prefix || '0930')"
            :initial-middle="String(route.query.middle || '')"
            :initial-end="String(route.query.end || '')"
            @search="runSearch"
          />
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 max-w-3xl pb-16">
      <div v-if="loading && !hasResults" class="card p-10 text-center text-muted">
        <div class="w-10 h-10 border-4 border-irancell-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        در حال جستجو...
      </div>

      <div v-else-if="!searched" class="card p-10 text-center text-muted">
        <div class="text-5xl mb-4 opacity-60">📱</div>
        <p>برای مشاهده نتایج، شماره مورد نظر را جستجو کنید</p>
      </div>

      <template v-else>
        <div v-if="result?.exact?.available" class="card overflow-hidden shadow-lg mb-6">
          <div class="bg-green-50 dark:bg-green-900/30 px-4 py-2 text-center text-sm font-bold text-green-700 dark:text-green-300">
            شماره موجود است
          </div>
          <SimSearchResults :numbers="[result.exact]" />
        </div>

        <div v-if="result?.unavailable && !result?.exact?.available" class="card p-6 text-center mb-4 border-red-200 dark:border-red-800">
          <p class="text-lg font-bold text-red-600 dark:text-red-400 mb-1">شماره درخواستی موجود نیست</p>
          <p v-if="searchedDisplay" class="font-black text-xl mt-2" dir="ltr">{{ searchedDisplay }}</p>
        </div>

        <div v-if="allNumbers.length" class="card overflow-hidden shadow-lg">
          <div class="bg-irancell-yellow/90 px-4 py-3 text-center">
            <h2 class="font-bold text-irancell-black">نتایج جستجو</h2>
          </div>

          <div
            v-if="result?.similarNumbers && result?.unavailable"
            class="mx-4 mt-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 flex gap-2"
          >
            <span class="shrink-0">ℹ️</span>
            <span>شماره دقیق یافت نشد. شماره‌هایی که در ۸ تا ۱۰ رقم اول شباهت دارند نمایش داده می‌شوند.</span>
          </div>

          <SimSearchResults :numbers="allNumbers" />

          <div v-if="result?.hasMore" class="p-4 border-t dark:border-gray-700">
            <button class="btn-outline w-full py-3" :disabled="loadingMore" @click="loadMore">
              {{ loadingMore ? 'در حال بارگذاری...' : 'نمایش بیشتر' }}
            </button>
          </div>
        </div>

        <div v-else-if="result?.unavailable" class="card p-10 text-center">
          <div class="text-5xl mb-4">😔</div>
          <p class="font-bold mb-2">نتیجه‌ای یافت نشد</p>
          <p class="text-muted text-sm mb-6">شماره مشابهی پیدا نشد — جستجو را با پیش‌شماره یا ارقام دیگر امتحان کنید</p>
          <NuxtLink to="/numbers" class="btn-outline py-2 px-6">مشاهده شماره‌های موجود</NuxtLink>
        </div>

        <div v-if="result?.error" class="card p-6 mt-4 text-center text-red-600">{{ result.error }}</div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  buildApiQuery,
  buildSearchPayload,
  countSearchDigits,
  formatMsisdnDisplay,
  payloadToQuery,
  queryToPayload,
  type SimSearchPayload,
} from '~/utils/numberSearch'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const toast = useToastStore()

const initialMode = computed(() => (route.query.mode === 'advanced' ? 'advanced' : 'simple') as 'simple' | 'advanced')

const searchRef = ref<{ getPayload: () => SimSearchPayload | null } | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
const searched = ref(false)
const result = ref<any>(null)
const accumulated = ref<any[]>([])
const lastPayload = ref<SimSearchPayload | null>(null)
const searchedDisplay = ref('')

const hasResults = computed(() =>
  !!accumulated.value.length || !!result.value?.exact || !!result.value?.similar?.length
)
const allNumbers = computed(() => {
  const map = new Map<string, any>()
  const source = accumulated.value.length ? accumulated.value : (result.value?.similar || [])
  for (const n of source) map.set(n.number, n)
  return [...map.values()]
})

const buildQuery = (payload: SimSearchPayload, offset = 0) => buildApiQuery(payload, offset)

const updateUrl = (payload: SimSearchPayload) => {
  router.replace({ query: payloadToQuery(payload) })
}

const runSearch = async (payload?: SimSearchPayload) => {
  const p = payload || searchRef.value?.getPayload()
  if (!p || countSearchDigits(p) < 3) {
    toast.warning('حداقل ۳ رقم برای جستجو وارد کنید')
    return
  }

  lastPayload.value = p
  loading.value = true
  searched.value = true
  accumulated.value = []
  result.value = null

  const built = buildSearchPayload(p)
  searchedDisplay.value = built.fullNumber
    ? formatMsisdnDisplay(built.fullNumber)
    : (p.mode === 'simple' ? p.query : formatMsisdnDisplay(`${p.prefix || '0930'}${p.middle || ''}${p.end || ''}`))

  try {
    const res = await apiFetch(buildQuery(p, 0))
    result.value = res.data
    accumulated.value = res.data?.similar || []
    updateUrl(p)
  } catch (e: any) {
    toast.error(e.message || 'خطا در جستجو')
    result.value = { unavailable: true, error: e.message }
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!lastPayload.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const offset = accumulated.value.length
    const res = await apiFetch(buildQuery(lastPayload.value, offset))
    const next = res.data?.similar || []
    accumulated.value = [...accumulated.value, ...next]
    if (result.value) {
      result.value.hasMore = res.data?.hasMore
    }
  } catch (e: any) {
    toast.error(e.message || 'خطا در بارگذاری')
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  const payload = queryToPayload(route.query as Record<string, string>)
  if (payload) runSearch(payload)
})
</script>
