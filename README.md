# Phone – دموی Keypad (PWA آفلاین)

React + TypeScript + Vite. بدون Backend و بدون API خارجی.

## رفتار نسخهٔ دمو
- فقط صفحهٔ **Keypad** فعال است؛ صفحه‌های **Calls** و **Contacts** سفید و خالی‌اند.
- دکمهٔ سبز تماس کار نمی‌کند و هیچ انیمیشنی ندارد؛ دکمهٔ جستجو و آیکون افزودن مخاطب هم غیرفعال‌اند.
- دکمه‌های شماره هنگام لمس فقط خاکستری ساده می‌شوند و با یک محو شدن سریع برمی‌گردند.
- هیچ کد دستوری (از جمله `*#06#` و `*1*1#`) کاری انجام نمی‌دهد.
- صدای DTMF، نگه داشتن 0 برای +، و دکمهٔ حذف (با نگه داشتن، پاک‌کردن پیاپی) باقی مانده‌اند.

## ۱) اجرا روی Windows
1. Node.js نسخهٔ LTS (۲۰ به بالا) را از https://nodejs.org نصب کنید.
2. پوشهٔ پروژه را در CMD یا PowerShell باز کنید:
   ```
   npm install
   npm run dev
   ```
   آدرس نمایش‌داده‌شده (مثلاً http://localhost:5173) را در مرورگر باز کنید. روی دسکتاپ اپ داخل قاب آیفون نمایش داده می‌شود.
3. برای تست نسخهٔ نهایی (با Service Worker):
   ```
   npm run build
   npm run preview
   ```
   Service Worker فقط در نسخهٔ build فعال است.

> اگر `npm install` کند بود/نصب نشد، رجیستری npm در دسترس خود (میرور) را با `npm config set registry <آدرس>` تنظیم کنید.

## ۲) انتشار روی Cloudflare Pages
**روش الف – اتصال به Git:** پروژه را در GitHub بگذارید → Cloudflare Dashboard ← Workers & Pages ← Create ← Pages ← Connect to Git، سپس:
- Build command: `npm run build`
- Build output directory: `dist`
- (در صورت نیاز) متغیر `NODE_VERSION` = `22`

**روش ب – آپلود مستقیم:** `npm run build` را اجرا کنید و پوشهٔ `dist` را در Pages ← Upload assets بکشید.

فایل `public/_headers` تضمین می‌کند `service-worker.js` و `index.html` کش مرورگر نشوند تا نسخهٔ جدید بدون مشکل جایگزین شود.

## ۳) نصب روی آیفون (Safari)
1. لینک Cloudflare Pages را در **Safari** باز کنید (حتماً Safari).
2. صبر کنید صفحه کامل بالا بیاید (در همین لحظه همه چیز Cache می‌شود).
3. دکمهٔ Share ← **Add to Home Screen** ← Add.
4. از آیکون روی Home Screen اجرا کنید؛ بدون نوار آدرس و بدون اینترنت کار می‌کند.

## معماری آفلاین
- `public/service-worker.js`: همهٔ فایل‌های build (HTML/JS/CSS/فونت/آیکون) در نصب Precache می‌شوند؛ منابع استاتیک Cache First؛ ناوبری همیشه از App Shell کش‌شده.
- پلاگین `precache-sw` در `vite.config.ts` بعد از build لیست فایل‌ها و یک هش نسخه را به Service Worker تزریق می‌کند. هر انتشار جدید کش جدا دارد و کش‌های قدیمی هنگام activate پاک می‌شوند.
- روی آیفون فونت SF Pro سیستم استفاده می‌شود؛ فونت Inter (با `@fontsource`) به‌عنوان جایگزین برای دستگاه‌های غیر اپل داخل خروجی build قرار می‌گیرد (بدون CDN). هیچ درخواست خارجی ارسال نمی‌شود.
- وضعیت برنامه (مخاطبین، علاقه‌مندی‌ها، تماس‌ها) در localStorage ذخیره می‌شود. منوی Edit ← Reset Data داده‌ها را به حالت اول برمی‌گرداند.

## ساختار
```
src/
  components/  Icons, TabBar, Menu, Sheet, DialKey, Avatar, ...
  pages/       Keypad, Calls, Contacts, ContactDetail, CallScreen, SearchOverlay, ContactForm
  data/        seed.ts (داده‌های نمونه)
  hooks/       useStore (state + localStorage), useApp, useTransitionMount, useFrameScale
  utils/       format, sound (DTMF), pwa
  styles/      fonts.css, base.css, components.css, pages.css
public/        manifest.json, service-worker.js, _headers, icons/
```

## محدودیت‌ها
نوار وضعیت (ساعت/باتری) در حالت نصب‌شده را خود iOS رسم می‌کند و فقط در حد APIهای رسمی قابل تنظیم است؛ پروژه از `safe-area-inset` برای Dynamic Island و Notch استفاده می‌کند.
