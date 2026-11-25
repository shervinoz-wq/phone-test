# Phone – بازسازی اپلیکیشن Phone آیفون (PWA آفلاین)

React + TypeScript + Vite. بدون Backend و بدون API خارجی. بعد از اولین بارگذاری کاملاً آفلاین کار می‌کند.

## صفحه‌ها (طراحی iOS 26 مطابق اسکرین‌شات‌های آیفون ۱۳ – ابعاد 390×844)
- **Keypad**: کلیدهای شیشه‌ای ۸۰pt، صدای DTMF، نگه داشتن 0 = +، نگه داشتن دکمه حذف = پاک‌کردن همه، آیکون افزودن مخاطب (بالا-راست)، و کارت پیشنهاد مخاطبین هنگام شماره‌گیری (جستجو بر اساس شماره یا حروف نام، «N More Results»). انیمیشن کلیک دکمه‌ها (بزرگ‌شدن، خاکستری‌شدن متن، کوچک‌تر از حالت عادی و برگشت؛ دکمهٔ تماس سبز فسفری) از روی فریم‌های ضبط‌شدهٔ آیفون بازسازی شده و در `src/hooks/usePressAnimation.ts` است.
- **Calls**: منوی Edit (Set Up Name and Photo / Add Favorite / Select)، منوی فیلتر (Classic/Unified، Calls، Missed، Voicemail)، حالت No Recents، علاقه‌مندی‌ها، حذف و Clear.
- **Contacts**: My Card، بخش‌های A–Z، فرم New Contact دقیقاً مطابق نمونه (add phone، Ringtone، Notes، ...)، صفحهٔ جزئیات مخاطب.
- **Search** (دکمهٔ گرد کنار تب‌بار): جستجو در مخاطبین و تماس‌ها، No Results.
- **تماس شبیه‌سازی‌شده**: هر تماس خروجی بلافاصله صفحهٔ «Call failed» را نشان می‌دهد؛ تماس ورودی هم از منوی Edit قابل شبیه‌سازی است.
- **کد `*#06#`**: به‌محض زدن `#` پایانی، کادر شماره خالی می‌شود و صفحهٔ Share Device Identifiers (IMEI / IMEI2 با بارکد Code 128) باز می‌شود. محتوای آن با اسکرول کشسانی iOS قابل اسکرول است (کشیده‌شدن بیش از حد در ابتدا/انتها و برگشت سریع).
- **صدای کیپد**: به‌طور پیش‌فرض خاموش است. با شماره‌گیری `*1*3#` بین روشن/خاموش جابه‌جا می‌شود (فقط یک پیغام «Keypad sounds enabled/disabled» نشان داده می‌شود).
- **حروف آواتار**: نام یک‌کلمه‌ای ← یک حرف؛ نام دو کلمه‌ای (نام + نام خانوادگی) ← دو حرف.
- از منوی Edit می‌توانید «Simulate Call» (تماس ورودی)، روشن/خاموش‌کردن صدای کیپد و «Reset Data» را بزنید.
اپ از حالت خالی شروع می‌شود (بدون مخاطب و تماس)؛ همهٔ داده‌ها محلی (localStorage) هستند؛ هیچ تماس واقعی برقرار نمی‌شود.

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
