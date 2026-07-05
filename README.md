# فروشگاه شماره ایرانسل

وب‌سایت اختصاصی فروش شماره‌های رند ایرانسل و محصولات جانبی (مودم و لوازم).

## تکنولوژی‌ها

| بخش | تکنولوژی |
|-----|----------|
| Backend | Node.js, Express.js, MongoDB |
| Frontend | Nuxt 3, Pinia, TailwindCSS |
| پرداخت | زرین‌پال |
| احراز هویت | JWT |

## ساختار پروژه

```
irancell-full/
├── backend/          # API سرور Express
│   └── src/
│       ├── config/
│       ├── models/
│       ├── repositories/
│       ├── services/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       └── validators/
├── frontend/         # Nuxt 3 SPA
│   ├── pages/
│   ├── components/
│   ├── stores/
│   └── composables/
└── README.md
```

## پیش‌نیازها

- Node.js 18+ (توصیه: Node.js 20 LTS)
- MongoDB 6+
- npm یا yarn

## نصب و راه‌اندازی

### ۱. کلون پروژه

```bash
git clone <repo-url>
cd "irancell full"
```

### ۲. Backend

```bash
cd backend
cp .env.example .env
# ویرایش .env و تنظیم MONGODB_URI و ZARINPAL_MERCHANT_ID

npm install
npm run seed    # ایجاد ادمین و داده‌های نمونه
npm run dev     # اجرا روی پورت 3001
```

### ۳. Frontend

```bash
cd frontend
cp .env.example .env

npm install
npm run dev     # اجرا روی پورت 3000
```

### ۴. دسترسی

| آدرس | توضیح |
|------|-------|
| http://localhost:3000 | سایت مشتری |
| http://localhost:3000/admin/login | پنل مدیریت |
| http://localhost:3000/i/09001071252 | صفحه اختصاصی شماره |
| http://localhost:3001/api/health | Health check API |

**ورود ادمین پیش‌فرض:**
- ایمیل: `admin@example.com`
- رمز: `admin123456`

## صفحات سایت

| مسیر | توضیح |
|------|-------|
| `/` | صفحه اصلی + جستجوی شماره |
| `/i/:number` | صفحه اختصاصی شماره (لینک SMS) |
| `/products` | لیست محصولات |
| `/product/:slug` | جزئیات محصول |
| `/cart` | سبد خرید |
| `/checkout` | ثبت اطلاعات و پرداخت |
| `/order-tracking` | پیگیری سفارش |
| `/payment/success` | پرداخت موفق |
| `/payment/failed` | پرداخت ناموفق |

## پنل مدیریت

| مسیر | توضیح |
|------|-------|
| `/admin` | داشبورد |
| `/admin/numbers` | مدیریت شماره‌ها |
| `/admin/numbers/import` | ورود گروهی Excel |
| `/admin/products` | مدیریت محصولات |
| `/admin/orders` | مدیریت سفارش‌ها |
| `/admin/discounts` | مدیریت تخفیف |

## API Endpoints

### عمومی
- `GET /api/numbers/:number` — دریافت شماره
- `GET /api/numbers/search?search=` — جستجو
- `GET /api/products` — لیست محصولات
- `POST /api/orders` — ثبت سفارش
- `POST /api/orders/:id/pay` — شروع پرداخت
- `GET /api/payment/verify` — Callback زرین‌پال
- `GET /api/orders/track` — پیگیری سفارش

### مدیریت (JWT)
- `POST /api/admin/login`
- `GET /api/admin/dashboard`
- CRUD شماره‌ها، محصولات، سفارش‌ها، تخفیف
- `POST /api/admin/numbers/import/preview`
- `POST /api/admin/numbers/import`

## آپلود Excel

فایل Excel با ستون‌های زیر:

| number | price | status |
|--------|-------|--------|
| 09001071252 | 15000000 | available |
| 09001234567 | 8500000 | available |

- `status` اختیاری (پیش‌فرض: available)
- شماره‌های تکراری وارد نمی‌شوند
- Preview قبل از Import

## تنظیم زرین‌پال

```env
ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZARINPAL_SANDBOX=true
ZARINPAL_CALLBACK_URL=http://localhost:3001/api/payment/verify
```

برای production:
- `ZARINPAL_SANDBOX=false`
- Callback URL را به دامنه واقعی تغییر دهید

## دیتابیس

Collections:
- `admins` — مدیران
- `users` — کاربران
- `numbers` — شماره‌ها
- `products` — محصولات
- `orders` — سفارش‌ها
- `payments` — تراکنش‌ها
- `discounts` — تخفیف‌ها

## Production

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && node .output/server/index.mjs
```

## معماری

- **Clean Architecture** — جداسازی لایه‌ها
- **Repository Pattern** — دسترسی به دیتا
- **Service Layer** — منطق کسب‌وکار
- **Validation** — express-validator
- **JWT Authentication** — احراز هویت ادمین

## لایسنس

Private — All rights reserved.
